"""
Utility routes for the Rescue Project Advanced application.
Handles alerts, feedback, advanced filtering, and real-time search.
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import login_required, current_user
from sqlalchemy import or_ # Import 'or_' for complex queries
from ..forms import FeedbackForm, FilterForm
from flask_mail import Message
import logging

utils_bp = Blueprint("utils", __name__)
logger = logging.getLogger(__name__)

@utils_bp.route("/alert")
@login_required
def alert():
    """Display recent reports as system alerts."""
    from ..models import Report  # Deferred import
    recent_reports = Report.query.order_by(Report.id.desc()).limit(5).all()
    return render_template("alert.html", alerts=recent_reports)

@utils_bp.route("/feedback", methods=["GET", "POST"])
@login_required
def feedback():
    """Handle feedback form submission."""
    form = FeedbackForm()
    if form.validate_on_submit():
        try:
            if current_app.config["MAIL_USERNAME"] and current_app.config["MAIL_PASSWORD"]:
                mail = current_app.extensions['mail']
                msg = Message(
                    f"Feedback: {form.subject.data}",
                    sender=current_app.config["MAIL_USERNAME"],
                    recipients=["admin@rescueapp.com"]
                )
                msg.body = f"From: {current_user.username}\n\n{form.message.data}"
                mail.send(msg)
                logger.info(f"Email notification sent for feedback from {current_user.username}")
        except Exception as mail_error:
            logger.warning(f"Email notification failed (feedback still recorded): {str(mail_error)}")
        
        logger.info(f"Feedback submitted by {current_user.username}")
        flash("Feedback submitted successfully!", "success")
        return redirect(url_for("main.index"))
    return render_template("feedback.html", form=form)

@utils_bp.route("/filter", methods=["GET", "POST"])
@login_required
def filter():
    """Handle advanced report filtering."""
    from ..models import Report  # Deferred import
    from datetime import datetime, timedelta
    from sqlalchemy import and_, or_

    # Base query - show all reports for admin, user's reports for regular users
    if current_user.is_admin:
        query = Report.query
    else:
        query = Report.query.filter_by(user_id=current_user.id)

    # Get filter parameters from request
    search_query = request.args.get('q', '').strip()
    gender = request.args.get('gender', '').strip()
    age_range = request.args.get('age_range', '').strip()
    area = request.args.get('area', '').strip()
    date_range = request.args.get('date_range', '').strip()
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort', 'newest').strip()

    # Apply filters
    filters = []

    # Text search across multiple fields
    if search_query:
        search_filter = or_(
            Report.name.ilike(f"%{search_query}%"),
            Report.area.ilike(f"%{search_query}%"),
            Report.description.ilike(f"%{search_query}%")
        )
        filters.append(search_filter)

    # Gender filter
    if gender:
        filters.append(Report.gender == gender)

    # Age range filter
    if age_range:
        try:
            if '-' in age_range:
                min_age, max_age = map(int, age_range.split('-'))
                filters.append(and_(Report.age >= min_age, Report.age <= max_age))
        except ValueError:
            pass  # Invalid age range format

    # Area filter
    if area:
        filters.append(Report.area.ilike(f"%{area}%"))

    # Date range filter
    if date_range:
        now = datetime.now()
        if date_range == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            filters.append(Report.created_at >= start_date)
        elif date_range == 'week':
            start_date = now - timedelta(days=7)
            filters.append(Report.created_at >= start_date)
        elif date_range == 'month':
            start_date = now - timedelta(days=30)
            filters.append(Report.created_at >= start_date)
        elif date_range == '3months':
            start_date = now - timedelta(days=90)
            filters.append(Report.created_at >= start_date)
        elif date_range == '6months':
            start_date = now - timedelta(days=180)
            filters.append(Report.created_at >= start_date)
        elif date_range == 'year':
            start_date = now - timedelta(days=365)
            filters.append(Report.created_at >= start_date)

    # Status filter
    if status:
        filters.append(Report.status == status)

    # Apply all filters
    if filters:
        query = query.filter(and_(*filters))

    # Apply sorting
    if sort_by == 'oldest':
        query = query.order_by(Report.created_at.asc())
    elif sort_by == 'name':
        query = query.order_by(Report.name.asc())
    elif sort_by == 'age_asc':
        query = query.order_by(Report.age.asc())
    elif sort_by == 'age_desc':
        query = query.order_by(Report.age.desc())
    else:  # newest (default)
        query = query.order_by(Report.created_at.desc())

    # Execute query
    filtered_reports = query.all()

    logger.info(f"Advanced filter applied by user {current_user.id}: {len(filtered_reports)} results")

    return render_template("filter.html", reports=filtered_reports)

@utils_bp.route("/filter_reports", methods=["POST"])
@login_required
def filter_reports():
    """Handle real-time dashboard search via AJAX."""
    from ..models import Report  # Deferred import
    from datetime import datetime, timedelta

    search_term = request.form.get("search", "")
    status_filter = request.form.get("status", "")
    area_filter = request.form.get("area", "")
    date_filter = request.form.get("date", "")
    sort_by = request.form.get("sort", "newest")

    if current_user.is_admin:
        query = Report.query
    else:
        query = Report.query.filter_by(user_id=current_user.id)

    # Apply search filter
    if search_term:
        query = query.filter(
            or_(
                Report.name.ilike(f"%{search_term}%"),
                Report.area.ilike(f"%{search_term}%"),
                Report.description.ilike(f"%{search_term}%")
            )
        )

    # Apply status filter (simulate status field)
    if status_filter:
        # Since we don't have a status field, we'll simulate it based on creation date
        if status_filter == "resolved":
            # Simulate resolved reports as older than 30 days
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Report.created_at < cutoff_date)
        elif status_filter == "pending":
            # Simulate pending as reports from last 7 days
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            query = query.filter(Report.created_at > cutoff_date)

    # Apply area filter
    if area_filter:
        query = query.filter(Report.area.ilike(f"%{area_filter}%"))

    # Apply date filter
    if date_filter:
        now = datetime.utcnow()
        if date_filter == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Report.created_at >= start_date)
        elif date_filter == "week":
            start_date = now - timedelta(days=7)
            query = query.filter(Report.created_at >= start_date)
        elif date_filter == "month":
            start_date = now - timedelta(days=30)
            query = query.filter(Report.created_at >= start_date)
        elif date_filter == "year":
            start_date = now - timedelta(days=365)
            query = query.filter(Report.created_at >= start_date)

    # Apply sorting
    if sort_by == "newest":
        query = query.order_by(Report.created_at.desc())
    elif sort_by == "oldest":
        query = query.order_by(Report.created_at.asc())
    elif sort_by == "name":
        query = query.order_by(Report.name.asc())
    elif sort_by == "area":
        query = query.order_by(Report.area.asc())
    elif sort_by == "status":
        query = query.order_by(Report.created_at.desc())  # Default to newest for status

    reports_result = query.all()

    # Simulate status based on creation date
    def get_simulated_status(report):
        if not report.created_at:
            return "active"
        days_old = (datetime.utcnow() - report.created_at).days
        if days_old > 30:
            return "resolved"
        elif days_old < 7:
            return "pending"
        elif days_old < 14:
            return "urgent"
        else:
            return "active"

    filtered_reports = [
        {
            "id": r.id,
            "name": r.name,
            "age": r.age,
            "gender": r.gender,
            "area": r.area,
            "description": r.description,
            "image": r.image,
            "status": get_simulated_status(r),
            "created_at": r.created_at.strftime('%Y-%m-%d %H:%M') if r.created_at else 'N/A'
        }
        for r in reports_result
    ]
    logger.info(f"Real-time search performed by {current_user.username}")
    return jsonify(filtered_reports)
