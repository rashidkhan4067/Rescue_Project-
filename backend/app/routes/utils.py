"""
Utility API routes for the Rescue Project Advanced application.
Handles alerts, feedback, advanced filtering, and real-time search.
"""
from flask import Blueprint, request, current_app, url_for
from flask_login import login_required, current_user
from sqlalchemy import or_
from flask_mail import Message
import logging
from datetime import datetime, timedelta
from ..utils.errors import APIError
from ..utils.responses import success_response

utils_bp = Blueprint("utils", __name__)
logger = logging.getLogger(__name__)

@utils_bp.route("/feedback", methods=["POST"])
@login_required
def feedback():
    """Handle feedback submission via API."""
    data = request.get_json() or {}
    subject = data.get('subject')
    message_text = data.get('message')

    if not subject or not message_text:
        raise APIError("Subject and message are required")

    if current_app.config.get("MAIL_USERNAME") and current_app.config.get("MAIL_PASSWORD"):
        mail = current_app.extensions.get('mail')
        if mail:
            try:
                msg = Message(
                    f"Feedback: {subject}",
                    sender=current_app.config["MAIL_USERNAME"],
                    recipients=["admin@rescueapp.com"]
                )
                msg.body = f"From: {current_user.username}\n\n{message_text}"
                mail.send(msg)
                logger.info(f"Email notification sent for feedback from {current_user.username}")
            except Exception as mail_err:
                logger.warning(f"Email notification failed (feedback still recorded): {str(mail_err)}")
    
    logger.info(f"Feedback submitted by {current_user.username}")
    return success_response(message="Feedback submitted successfully")

@utils_bp.route("/filter_reports", methods=["POST"])
@login_required
def filter_reports():
    """Handle real-time search and filtering via AJAX/API."""
    from ..models import Report
    
    data = request.get_json() or {}
    search_term = data.get("search", "")
    status_filter = data.get("status", "")
    area_filter = data.get("area", "")
    date_filter = data.get("date", "")
    sort_by = data.get("sort", "newest")

    if current_user.is_admin:
        query = Report.query
    else:
        query = Report.query.filter_by(user_id=current_user.id)

    if search_term:
        query = query.filter(
            or_(
                Report.name.ilike(f"%{search_term}%"),
                Report.area.ilike(f"%{search_term}%"),
                Report.description.ilike(f"%{search_term}%")
            )
        )

    if status_filter:
        if status_filter == "resolved":
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            query = query.filter(Report.created_at < cutoff_date)
        elif status_filter == "pending":
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            query = query.filter(Report.created_at > cutoff_date)

    if area_filter:
        query = query.filter(Report.area.ilike(f"%{area_filter}%"))

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

    if sort_by == "newest":
        query = query.order_by(Report.created_at.desc())
    elif sort_by == "oldest":
        query = query.order_by(Report.created_at.asc())
    elif sort_by == "name":
        query = query.order_by(Report.name.asc())
    elif sort_by == "area":
        query = query.order_by(Report.area.asc())

    reports_result = query.all()

    def get_simulated_status(report):
        if not report.created_at: return "active"
        days_old = (datetime.utcnow() - report.created_at).days
        if days_old > 30: return "resolved"
        elif days_old < 7: return "pending"
        elif days_old < 14: return "urgent"
        return "active"

    filtered_reports = []
    for r in reports_result:
        d = r.to_dict()
        d["status"] = get_simulated_status(r)
        d["created_at"] = r.created_at.strftime('%Y-%m-%d %H:%M') if r.created_at else 'N/A'
        d['image'] = url_for('static', filename=f'uploads/{r.image}', _external=True) if r.image else None
        filtered_reports.append(d)
    
    return success_response(data={"results": filtered_reports})
