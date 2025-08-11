"""
Main routes for the Rescue Project Advanced application.
Handles index, report submission, dashboard, contact, and chatbot pages.
"""
from flask import Blueprint, render_template, redirect, url_for, flash, current_app, request, jsonify
from sqlalchemy import or_
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import uuid
import os
import datetime
import logging
from ..forms import ReportForm, ProfileForm
from flask_mail import Message
from ..utils.helpers import allowed_file, save_uploaded_file

main_bp = Blueprint("main", __name__)
logger = logging.getLogger(__name__)

@main_bp.route("/")
def index():
    """Render the home page."""
    return render_template("index.html")

@main_bp.route("/report", methods=["GET", "POST"])
@login_required
def report():
    """Handle missing person report submission."""
    from ..models import Report, db  # Deferred import
    form = ReportForm()

    # Debug logging
    if request.method == 'POST':
        logger.info(f"Report submission attempt by user {current_user.id}")
        logger.info(f"Form data received: {request.form.to_dict()}")
        logger.info(f"Form validation result: {form.validate()}")
        if form.errors:
            logger.error(f"Form validation errors: {form.errors}")

    # Handle form submission - simplified approach
    if request.method == 'POST':
        logger.info(f"Report submission attempt by user {current_user.id}")
        logger.info(f"Request form keys: {list(request.form.keys())}")
        logger.info(f"Request files keys: {list(request.files.keys())}")

        # Get form data directly from request
        name = request.form.get('name', '').strip()
        age = request.form.get('age', '').strip()
        gender = request.form.get('gender', '').strip()
        area = request.form.get('area', '').strip()
        description = request.form.get('description', '').strip()
        last_seen_date = request.form.get('last_seen_date', '').strip()
        last_seen_time = request.form.get('last_seen_time', '').strip()

        logger.info(f"Form data received: name='{name}', age='{age}', gender='{gender}', area='{area}', description='{description[:50]}...'")
        logger.info(f"Date/time data: date='{last_seen_date}', time='{last_seen_time}'")

        # Basic validation
        errors = []
        if not name:
            errors.append("Name is required")
        if not age:
            errors.append("Age is required")
        else:
            try:
                age_int = int(age)
                if age_int < 0 or age_int > 120:
                    errors.append("Age must be between 0 and 120")
            except ValueError:
                errors.append("Age must be a valid number")
        if not gender:
            errors.append("Gender is required")
        if not area:
            errors.append("Location is required")
        if not description:
            errors.append("Description is required")

        if not errors:
            # All validation passed, create the report
            try:
                from ..models import Report
                from datetime import date, time, datetime

                # Parse date and time if provided
                parsed_date = None
                parsed_time = None

                if last_seen_date:
                    try:
                        parsed_date = datetime.strptime(last_seen_date, '%Y-%m-%d').date()
                    except ValueError:
                        parsed_date = date.today()
                else:
                    parsed_date = date.today()

                if last_seen_time:
                    try:
                        parsed_time = datetime.strptime(last_seen_time, '%H:%M').time()
                    except ValueError:
                        parsed_time = time(12, 0)
                else:
                    parsed_time = time(12, 0)

                # Handle file upload
                image_filename = None
                if 'image' in request.files:
                    file = request.files['image']
                    if file and file.filename and allowed_file(file.filename):
                        try:
                            image_filename = save_uploaded_file(file)
                            logger.info(f"Image uploaded successfully: {image_filename}")
                        except Exception as e:
                            logger.warning(f"Image upload failed: {e}")

                # Create the report
                new_report = Report(
                    name=name,
                    age=int(age),
                    gender=gender,
                    area=area,
                    description=description,
                    last_seen_date=parsed_date,
                    last_seen_time=parsed_time,
                    image=image_filename,
                    user_id=current_user.id,
                    status='active'
                )

                # Save to database
                db = current_app.extensions['sqlalchemy']
                db.session.add(new_report)
                db.session.commit()

                logger.info(f"Report submitted successfully by user {current_user.id}: Report ID {new_report.id}")
                flash(f"Report submitted successfully! Report ID: {new_report.id}", "success")
                return redirect(url_for('main.dashboard'))

            except Exception as e:
                logger.error(f"Report submission failed for user {current_user.id}: {str(e)}")
                flash(f"Error submitting report: {str(e)}", "error")
        else:
            # Validation errors
            for error in errors:
                flash(error, "error")
            logger.error(f"Form validation failed for user {current_user.id}: {errors}")

    # For GET requests or failed submissions, show the form

    from datetime import date
    return render_template("report.html", form=form, today=date.today().isoformat())

@main_bp.route("/simple-report", methods=["GET", "POST"])
@login_required
def simple_report():
    """Simple report form for testing without JavaScript complications."""
    from ..models import Report, db  # Deferred import
    form = ReportForm()

    # Debug logging
    if request.method == 'POST':
        logger.info(f"Simple report submission attempt by user {current_user.id}")
        logger.info(f"Form data received: {request.form.to_dict()}")
        logger.info(f"Form validation result: {form.validate()}")
        if form.errors:
            logger.error(f"Form validation errors: {form.errors}")

    # Handle form submission - simplified approach
    if request.method == 'POST':
        logger.info(f"Simple report submission attempt by user {current_user.id}")

        # Get form data directly from request
        name = request.form.get('name', '').strip()
        age = request.form.get('age', '').strip()
        gender = request.form.get('gender', '').strip()
        area = request.form.get('area', '').strip()
        description = request.form.get('description', '').strip()

        logger.info(f"Form data received: name={name}, age={age}, gender={gender}, area={area}")

        # Basic validation
        errors = []
        if not name:
            errors.append("Name is required")
        if not age:
            errors.append("Age is required")
        else:
            try:
                age_int = int(age)
                if age_int < 0 or age_int > 120:
                    errors.append("Age must be between 0 and 120")
            except ValueError:
                errors.append("Age must be a valid number")
        if not gender:
            errors.append("Gender is required")
        if not area:
            errors.append("Location is required")
        if not description:
            errors.append("Description is required")

        if not errors:
            # All validation passed, create the report
            try:
                from ..models import Report
                from datetime import date, time

                # Create the report
                new_report = Report(
                    name=name,
                    age=int(age),
                    gender=gender,
                    area=area,
                    description=description,
                    last_seen_date=date.today(),
                    last_seen_time=time(12, 0),
                    user_id=current_user.id,
                    status='active'
                )

                # Save to database
                db = current_app.extensions['sqlalchemy']
                db.session.add(new_report)
                db.session.commit()

                logger.info(f"Simple report submitted successfully by user {current_user.id}: Report ID {new_report.id}")
                flash(f"Report submitted successfully! Report ID: {new_report.id}", "success")
                return redirect(url_for('main.dashboard'))

            except Exception as e:
                logger.error(f"Simple report submission failed for user {current_user.id}: {str(e)}")
                flash(f"Error submitting report: {str(e)}", "error")
        else:
            # Validation errors
            for error in errors:
                flash(error, "error")
            logger.error(f"Simple form validation failed for user {current_user.id}: {errors}")

    # For GET requests or failed submissions, show the form
        try:
            filename = None
            if form.image.data and form.image.data.filename:
                filename = save_uploaded_file(form.image.data)
                if not filename:
                    flash("Failed to upload image. Please check file type and size (max 10MB).", "error")
                    from datetime import date
                    return render_template("simple_report.html", form=form, today=date.today().isoformat())

            report = Report(
                # Personal Information
                name=form.name.data.strip(),
                age=form.age.data,
                gender=form.gender.data,

                # Location Information
                area=form.area.data.strip(),
                last_seen_date=form.last_seen_date.data,
                last_seen_time=form.last_seen_time.data,

                # Description and Media
                description=form.description.data.strip(),
                image=filename,

                # Metadata
                user_id=current_user.id,
                status="active"
            )
            db.session.add(report)
            db.session.commit()
            logger.info(f"Simple report submitted successfully by user {current_user.id}: Report ID {report.id}")
            flash("Report submitted successfully!", "success")
            return redirect(url_for("main.dashboard"))
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error submitting simple report: {str(e)}")
            flash("An error occurred while submitting the report. Please try again.", "error")
            from datetime import date
            return render_template("simple_report.html", form=form, today=date.today().isoformat())

    # Handle form validation errors
    if request.method == 'POST' and form.errors:
        logger.error(f"Simple form validation failed for user {current_user.id}: {form.errors}")
        for field, errors in form.errors.items():
            for error in errors:
                flash(f"{field.replace('_', ' ').title()}: {error}", "error")

    from datetime import date
    return render_template("simple_report.html", form=form, today=date.today().isoformat())

@main_bp.route("/debug-reports")
@login_required
def debug_reports():
    """Debug route to show current reports."""
    from ..models import Report  # Deferred import

    reports = Report.query.all()
    reports_data = []

    for report in reports:
        reports_data.append({
            'id': report.id,
            'name': report.name,
            'user_id': report.user_id,
            'created_at': report.created_at,
            'status': getattr(report, 'status', 'N/A')
        })

    return {
        'total_reports': len(reports),
        'current_user_id': current_user.id,
        'current_user_is_admin': current_user.is_admin,
        'reports': reports_data
    }

@main_bp.route("/test-submit", methods=["GET", "POST"])
@login_required
def test_submit():
    """Test route to debug form submissions."""
    if request.method == 'POST':
        logger.info("=== TEST SUBMIT RECEIVED ===")
        logger.info(f"User: {current_user.id}")
        logger.info(f"Form data: {dict(request.form)}")
        logger.info(f"Files: {dict(request.files)}")
        logger.info("=== END TEST SUBMIT ===")

        return {
            'status': 'received',
            'user_id': current_user.id,
            'form_data': dict(request.form),
            'files': list(request.files.keys())
        }

    return '''
    <h1>Test Form Submission</h1>
    <form method="POST" enctype="multipart/form-data">
        <p>Name: <input type="text" name="name" value="Test Person" required></p>
        <p>Age: <input type="number" name="age" value="25" required></p>
        <p>Gender: <select name="gender" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </select></p>
        <p>Area: <input type="text" name="area" value="Test Location" required></p>
        <p>Description: <textarea name="description" required>Test description</textarea></p>
        <p><button type="submit">Test Submit</button></p>
    </form>
    '''



@main_bp.route("/dashboard")
@login_required
def dashboard():
    """Render the user/admin dashboard with reports."""
    from ..models import Report  # Deferred import
    reports = Report.query.all() if current_user.is_admin else Report.query.filter_by(user_id=current_user.id).all()
    return render_template("dashboard.html", reports=reports)

@main_bp.route("/contact")
def contact():
    """Render the contact page."""
    return render_template("contact.html")

@main_bp.route("/chatbot")
def chatbot():
    """Render the AI chatbot placeholder page."""
    return render_template("chatbot.html")

@main_bp.route("/search")
@login_required
def search():
    """Search reports by name, area or description with improved functionality."""
    from ..models import Report
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = 12
        suggestions_only = request.args.get('suggestions') == 'true'

        current_app.logger.info(f"Search initiated for query: '{query}', suggestions_only: {suggestions_only}")

        if not query:
            current_app.logger.info("Empty search query received")
            if suggestions_only:
                return jsonify([])
            else:
                # Show reports based on user role
                if current_user.is_admin:
                    # Admins can see all reports
                    all_reports = Report.query.order_by(Report.created_at.desc()).paginate(
                        page=page, per_page=per_page, error_out=False
                    )
                else:
                    # Regular users can only see their own reports
                    all_reports = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).paginate(
                        page=page, per_page=per_page, error_out=False
                    )
                results = [{
                    'id': report.id,
                    'name': report.name,
                    'area': report.area,
                    'description': report.description[:150] + '...' if len(report.description) > 150 else report.description,
                    'image': url_for('static', filename=f'uploads/{report.image}') if report.image else None,
                    'created_at': report.created_at.strftime('%B %d, %Y') if report.created_at else 'Recent',
                    'age': report.age,
                    'gender': report.gender
                } for report in all_reports.items]

                return render_template('search_results.html',
                                     results=results,
                                     query='',
                                     total_results=all_reports.total,
                                     pagination=all_reports)

        # Search with relevance scoring and user-based filtering
        base_query = Report.query

        # Apply user-based filtering
        if not current_user.is_admin:
            # Regular users can only search their own reports
            base_query = base_query.filter_by(user_id=current_user.id)

        search_results = base_query.filter(
            or_(
                Report.name.ilike(f'%{query}%'),
                Report.area.ilike(f'%{query}%'),
                Report.description.ilike(f'%{query}%')
            )
        ).order_by(
            Report.name.ilike(f'%{query}%').desc(),  # Higher priority for name matches
            Report.area.ilike(f'%{query}%').desc(),
            Report.created_at.desc()  # Newer reports first
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        results = [{
            'id': report.id,
            'name': report.name,
            'area': report.area,
            'description': report.description[:150] + '...' if len(report.description) > 150 else report.description,
            'image': url_for('static', filename=f'uploads/{report.image}') if report.image else None,
            'created_at': report.created_at.strftime('%B %d, %Y') if report.created_at else 'Recent',
            'age': report.age,
            'gender': report.gender,
            'status': getattr(report, 'status', 'active'),
            'url': url_for('main.report_details', report_id=report.id)
        } for report in search_results.items]

        # For header search suggestions, return simplified format
        if suggestions_only:
            suggestions = [{
                'text': f"{report['name']} - {report['area']}",
                'url': report['url'],
                'id': report['id']
            } for report in results[:5]]  # Limit to 5 suggestions
            return jsonify(suggestions)

        # For full search results page
        return render_template('search_results.html',
                             results=results,
                             query=query,
                             total_results=search_results.total,
                             pagination=search_results)
        
    except Exception as e:
        logger.error(f"Search failed for query '{query}': {str(e)}")
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500

@main_bp.route("/report/<int:report_id>")
def report_details(report_id):
    """View detailed information about a specific report."""
    from ..models import Report  # Deferred import
    report = Report.query.get_or_404(report_id)
    return render_template("report_details.html", report=report)

@main_bp.route("/alert")
@login_required
def alert():
    """Render the premium alerts page with recent missing person reports."""
    from ..models import Report  # Deferred import
    from datetime import datetime, timedelta

    # Get all alerts for admin, user's alerts for regular users
    if current_user.is_admin:
        alerts = Report.query.order_by(Report.created_at.desc()).limit(50).all()
    else:
        alerts = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).limit(20).all()

    # Calculate statistics for the hero section
    now = datetime.now()
    twenty_four_hours_ago = now - timedelta(hours=24)

    # Count urgent alerts (first 3 are considered urgent for demo)
    urgent_count = min(3, len(alerts))

    # Count recent alerts (last 24 hours)
    recent_count = sum(1 for alert in alerts if alert.created_at and alert.created_at >= twenty_four_hours_ago)

    logger.info(f"Alert page accessed by user {current_user.id}: {len(alerts)} alerts, {urgent_count} urgent, {recent_count} recent")

    return render_template("alert.html",
                         alerts=alerts,
                         urgent_count=urgent_count,
                         recent_count=recent_count)

@main_bp.route("/profile")
@login_required
def profile():
    """Render the user profile page."""
    return render_template("profile.html", user=current_user)

@main_bp.route("/edit-profile", methods=["GET", "POST"])
@login_required
def edit_profile():
    """Handle profile editing with enhanced functionality."""
    form = ProfileForm(obj=current_user)
    
    if request.method == "POST" and form.validate_on_submit():
        try:
            db = current_app.extensions['sqlalchemy']
            
            # Handle avatar upload
            avatar_file = form.avatar.data
            if avatar_file and allowed_file(avatar_file.filename):
                filename = secure_filename(f"{uuid.uuid4()}_{avatar_file.filename}")
                avatar_file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
                current_user.avatar_url = url_for('static', filename=f'uploads/{filename}')
            
            # Update basic info
            current_user.username = form.username.data
            current_user.email = form.email.data
            
            # Update social media links
            current_user.twitter = form.twitter.data
            current_user.facebook = form.facebook.data
            current_user.linkedin = form.linkedin.data
            
            # Update notification preferences
            current_user.email_notifications = form.email_notifications.data
            current_user.push_notifications = form.push_notifications.data
            
            current_user.last_seen = datetime.utcnow()
            
            # Handle password change if provided
            if form.current_password.data and form.new_password.data:
                if current_user.check_password(form.current_password.data):
                    current_user.set_password(form.new_password.data)
                    flash("Password changed successfully", "success")
                else:
                    flash("Current password is incorrect", "error")
                    return render_template("edit_profile.html", form=form)
            
            db.session.commit()
            logger.info(f"Profile updated for user: {current_user.username}")
            flash("Profile updated successfully!", "success")
            return redirect(url_for("main.profile"))
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Profile update failed for {current_user.username}: {str(e)}")
            flash(f"Error updating profile: {str(e)}", "error")
    
    # Pre-populate form with current user data
    form.username.data = current_user.username
    form.email.data = current_user.email
    form.twitter.data = current_user.twitter
    form.facebook.data = current_user.facebook
    form.linkedin.data = current_user.linkedin
    form.email_notifications.data = current_user.email_notifications
    form.push_notifications.data = current_user.push_notifications
    
    return render_template("edit_profile.html", form=form)
