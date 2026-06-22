"""
Blueprint for Case Files Registry routes in the Rescue Project application.
"""
from flask import Blueprint, request, url_for
from sqlalchemy import or_
from flask_login import login_required, current_user
from datetime import datetime, date, time
import logging
from ..models import Report
from ..utils.helpers import allowed_file, save_uploaded_file
from ..utils.errors import APIError
from ..utils.responses import success_response
from ..services.groq_service import GroqAIService

cases_bp = Blueprint("cases", __name__)
logger = logging.getLogger(__name__)

@cases_bp.route("/report", methods=["POST"])
@login_required
def report():
    """Handle missing person report submission via API."""
    data = request.form if request.form else request.get_json() or {}
    
    name = data.get('name', '').strip()
    age = data.get('age', '')
    gender = data.get('gender', '').strip()
    area = data.get('area', '').strip()
    description = data.get('description', '').strip()
    
    # New physical attributes
    height = data.get('height', '').strip()
    weight = data.get('weight', '').strip()
    hair = data.get('hair', '').strip()
    eyes = data.get('eyes', '').strip()
    clothing = data.get('clothing', '').strip()
    marks = data.get('marks', '').strip()
    severity = data.get('severity', 'Standard Search').strip()
    
    if not all([name, age, gender, area, description]):
        raise APIError("Missing required fields")

    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            image_filename = save_uploaded_file(file)

    new_report = Report(
        name=name,
        age=int(age),
        gender=gender,
        area=area,
        description=description,
        last_seen_date=date.today(),
        last_seen_time=time(12, 0),
        image=image_filename,
        user_id=current_user.id,
        status='active',
        height=height or None,
        weight=weight or None,
        hair=hair or None,
        eyes=eyes or None,
        clothing=clothing or None,
        marks=marks or None,
        severity=severity
    )
    new_report.save()
    
    return success_response(
        data={"report_id": new_report.id},
        message="Report submitted successfully",
        status_code=201
    )

@cases_bp.route("/dashboard")
@login_required
def dashboard():
    """Get all reports for the user/admin."""
    reports = Report.query.all() if current_user.is_admin else Report.query.filter_by(user_id=current_user.id).all()
    reports_data = []
    for r in reports:
        d = r.to_dict()
        d['image'] = url_for('static', filename=f'uploads/{r.image}', _external=True) if r.image else None
        reports_data.append(d)
    return success_response(data={"reports": reports_data})

@cases_bp.route("/search")
@login_required
def search():
    """Search reports via API using high-performance AI semantic matching."""
    query = request.args.get('q', '').strip()
    
    base_query = Report.query
    if not current_user.is_admin:
        base_query = base_query.filter_by(user_id=current_user.id)
        
    reports = base_query.all()
    
    # Attempt AI Semantic Search if query is active and Groq API key exists
    groq_service = GroqAIService()
    if groq_service.api_key and query and len(reports) > 0:
        try:
            logger.info(f"Using Groq AIService for Semantic Search matching: '{query}'")
            
            # Format cases into compact JSON list context for LLM semantic matching
            cases_list = []
            for r in reports:
                cases_list.append({
                    "id": r.id,
                    "name": r.name,
                    "age": r.age,
                    "gender": r.gender,
                    "area": r.area,
                    "description": r.description,
                    "clothing": r.clothing or "",
                    "marks": r.marks or "",
                    "hair": r.hair or "",
                    "eyes": r.eyes or ""
                })
                
            prompt = f"User Query: \"{query}\"\nAvailable Case Database Shard: {cases_list}"
            
            system_prompt = (
                "You are the AI Semantic Search Processor for the Rescue Command Portal.\n"
                "Your job is to semantically match a user's natural language search query against a list of active missing person cases.\n"
                "Identify any cases that match the description (age groups, physical descriptors, clothing, location/landmark context, gender).\n"
                "You MUST return a JSON object with a single 'matches' key containing a list of matched objects sorted by semantic relevance score (0-100):\n"
                "{\n"
                "  \"matches\": [\n"
                "    { \"id\": 1, \"score\": 95, \"reason\": \" matches child profile, Bosan road location, and uniform clothing tags.\" }\n"
                "  ]\n"
                "}\n"
                "Only match active cases that have a real logical overlap. Return an empty list if there are no matches."
            )
            
            raw_reply = groq_service.generate_response(prompt, system_prompt, json_format=True)
            
            import json
            parsed = json.loads(raw_reply)
            matches = parsed.get("matches", [])
            
            # Reorder reports based on semantic match scores
            match_dict = {m["id"]: m for m in matches}
            
            semantic_results = []
            for r in reports:
                if r.id in match_dict:
                    d = r.to_dict()
                    d['image'] = url_for('static', filename=f'uploads/{r.image}', _external=True) if r.image else None
                    d['ai_match_score'] = match_dict[r.id]["score"]
                    d['ai_match_reason'] = match_dict[r.id]["reason"]
                    semantic_results.append(d)
                    
            # Sort results by match score descending
            semantic_results.sort(key=lambda x: x.get('ai_match_score', 0), reverse=True)
            
            if len(semantic_results) > 0:
                logger.info(f"AI Semantic Search successfully mapped {len(semantic_results)} ranked results.")
                return success_response(data={"results": semantic_results})
                
        except Exception as e:
            logger.error(f"AI Semantic Search failed, falling back to standard SQL: {str(e)}")
            
    # Fallback to standard SQL ILIKE search
    logger.info("Executing standard SQL ILIKE query fallback")
    if query:
        search_results = base_query.filter(
            or_(
                Report.name.ilike(f'%{query}%'),
                Report.area.ilike(f'%{query}%'),
                Report.description.ilike(f'%{query}%')
            )
        ).all()
    else:
        search_results = base_query.all()
        
    results = []
    for r in search_results:
        d = r.to_dict()
        d['image'] = url_for('static', filename=f'uploads/{r.image}', _external=True) if r.image else None
        results.append(d)
        
    return success_response(data={"results": results})

@cases_bp.route("/report/<int:report_id>")
def report_details(report_id):
    """Get details of a specific report."""
    report = Report.query.get_or_404(report_id)
    d = report.to_dict()
    d['image'] = url_for('static', filename=f'uploads/{report.image}', _external=True) if report.image else None
    return success_response(data=d)

@cases_bp.route("/report/<int:report_id>/status", methods=["PATCH"])
@login_required
def update_report_status(report_id):
    """Toggle or update status of a report (active / resolved)."""
    report = Report.query.get_or_404(report_id)
    
    # Check permissions
    if not current_user.is_admin and report.user_id != current_user.id:
        raise APIError("Unauthorized", 403)
        
    data = request.get_json() or {}
    new_status = data.get('status', 'resolved')
    if new_status not in ['active', 'resolved', 'pending', 'urgent']:
        raise APIError("Invalid status")
        
    report.update(status=new_status)
    return success_response(
        data={"status": new_status},
        message=f"Case status updated to {new_status}"
    )

@cases_bp.route("/alert")
@login_required
def alert():
    """Get urgent/recent reports via API."""
    if current_user.is_admin:
        alerts = Report.query.order_by(Report.created_at.desc()).limit(50).all()
    else:
        alerts = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).limit(20).all()
        
    alerts_data = []
    for r in alerts:
        d = r.to_dict()
        d['image'] = url_for('static', filename=f'uploads/{r.image}', _external=True) if r.image else None
        alerts_data.append(d)
    return success_response(data={"alerts": alerts_data})


@cases_bp.route("/report/<int:report_id>", methods=["PUT"])
@login_required
def edit_report(report_id):
    """Edit details of a specific report (Author or Admin only)."""
    report = Report.query.get_or_404(report_id)
    
    # Check permissions (either creator or admin)
    if not current_user.is_admin and report.user_id != current_user.id:
        raise APIError("Unauthorized", 403)
        
    data = request.get_json() or {}
    
    updates = {}
    if 'name' in data:
        updates['name'] = data['name'].strip()
    if 'age' in data:
        try:
            updates['age'] = int(data['age'])
        except ValueError:
            raise APIError("Age must be an integer")
    if 'gender' in data:
        updates['gender'] = data['gender'].strip()
    if 'area' in data:
        updates['area'] = data['area'].strip()
    if 'description' in data:
        updates['description'] = data['description'].strip()
    if 'status' in data:
        if data['status'] not in ['active', 'resolved', 'pending', 'urgent']:
            raise APIError("Invalid status value")
        updates['status'] = data['status'].strip()
    if 'severity' in data:
        updates['severity'] = data['severity'].strip()
        
    # Physical descriptors
    for field in ['height', 'weight', 'hair', 'eyes', 'clothing', 'marks']:
        if field in data:
            val = data[field].strip() if data[field] else None
            updates[field] = val
            
    report.update(**updates)
    logger.info(f"User {current_user.username} updated report {report.name} (ID: {report.id})")
    return success_response(data=report.to_dict(), message="Report updated successfully")
