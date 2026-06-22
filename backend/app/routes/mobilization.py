"""
Blueprint for Ground Mobilization routes in the Rescue Project application.
"""
from flask import Blueprint, request
from flask_login import login_required, current_user
import logging
import re
import datetime
from ..models import Report, Volunteer
from ..utils_mail import send_sector_mobilization_email
from ..utils.errors import APIError
from ..utils.responses import success_response

mobilization_bp = Blueprint("mobilization", __name__)
logger = logging.getLogger(__name__)

@mobilization_bp.route("/volunteers", methods=["GET"])
@login_required
def get_volunteers():
    """Retrieve all search volunteers registered in the system."""
    volunteers = Volunteer.query.order_by(Volunteer.created_at.desc()).all()
    volunteers_data = [v.to_dict() for v in volunteers]
    return success_response(data=volunteers_data)

@mobilization_bp.route("/volunteers", methods=["POST"])
@login_required
def register_volunteer():
    """Register a new ground search volunteer in the database."""
    data = request.get_json() or {}
    
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    sector = data.get("sector", "").strip()
    role = data.get("role", "Field Rescuer").strip()
    status = data.get("status", "Standby").strip()
    
    if not all([name, email, phone, sector]):
        raise APIError("Missing required fields: name, email, phone, and sector are mandatory")
        
    existing = Volunteer.query.filter_by(email=email).first()
    if existing:
        raise APIError("A volunteer with this email address is already registered.")
        
    new_volunteer = Volunteer(
        name=name,
        email=email,
        phone=phone,
        sector=sector,
        role=role,
        status=status
    )
    new_volunteer.save()
    
    return success_response(
        data=new_volunteer.to_dict(),
        message="Volunteer registered successfully",
        status_code=201
    )

@mobilization_bp.route("/volunteers/mobilize", methods=["POST"])
@login_required
def mobilize_sector_volunteers():
    """Trigger a geolocated ground volunteer mobilization broadcast."""
    data = request.get_json() or {}
    sector = data.get("sector", "Sector G-10")
    
    # 1. Fetch active cases containing the target sector in their "area" field
    active_reports = Report.query.filter_by(status='active').all()
    matching_reports = []
    for r in active_reports:
        if sector.lower() in r.area.lower():
            matching_reports.append(r)
            
    # 2. Identify system responders (volunteers) for that sector in the database
    sector_volunteers = Volunteer.query.filter(Volunteer.sector.ilike(f"%{sector}%")).all()
    
    sent_count = 0
    dispatched_volunteers = []
    
    # Send directly to the active coordinator to confirm SMTP success
    try:
        send_sector_mobilization_email(
            recipient_email=current_user.email,
            sector=sector,
            volunteer_name=current_user.username,
            active_cases=matching_reports
        )
        sent_count += 1
    except Exception as err:
        logger.error(f"Failed to dispatch coordinate email to admin coordinator: {str(err)}")
        
    for v in sector_volunteers:
        if v.status == 'Standby':
            v.update(status='Active')
            
        dispatched_volunteers.append({
            "id": v.id,
            "name": v.name,
            "email": v.email,
            "role": v.role
        })
        
        try:
            send_sector_mobilization_email(
                recipient_email=v.email,
                sector=sector,
                volunteer_name=v.name,
                active_cases=matching_reports
            )
            sent_count += 1
        except Exception as err:
            logger.error(f"Failed to send mobilization email to volunteer {v.email}: {str(err)}")
            
    return success_response(
        data={
            "dispatched_count": sent_count,
            "sector": sector,
            "cases_found": [r.to_dict() for r in matching_reports],
            "responders_mobilized": len(sector_volunteers),
            "volunteers": dispatched_volunteers
        },
        message=f"Emergency Mobilization Dispatched successfully to {sector} boundary grid."
    )

@mobilization_bp.route("/radar/coordinates", methods=["GET"])
@login_required
def get_radar_coordinates():
    """Fetch advanced tactical radar coordinates and telemetry logs for both cases and volunteers."""
    reports = Report.query.all()
    volunteers = Volunteer.query.all()
    
    radar_data = []
    for r in reports:
        lat, lng = 33.68, 73.04
        area_string = r.area or ""
        is_multan = "multan" in area_string.lower()
        if is_multan:
            lat, lng = 30.1575, 71.5249

        match = re.search(r"\((-?\d+\.\d+)[°\s]*[NS]?,\s*(-?\d+\.\d+)[°\s]*[EW]?\)", area_string)
        if match:
            lat = float(match[1])
            lng = float(match[2])
        else:
            hash_val = sum(ord(char) for char in area_string)
            if is_multan:
                lat = 30.15 + ((hash_val % 30) / 1000)
                lng = 71.52 + ((hash_val % 50) / 1000)
            else:
                lat = 33.68 + ((hash_val % 30) / 1000)
                lng = 73.04 + ((hash_val % 50) / 1000)
            
        created_time = r.created_at or datetime.datetime.now()
        elapsed_hours = (datetime.datetime.now() - created_time).total_seconds() / 3600
        perimeter_radius = 500
        if r.status == 'active':
            perimeter_radius = int(500 + min(3000, elapsed_hours * 250))
            
        hash_val = sum(ord(char) for char in area_string)
        signal_strength = "92% (High-Fidelity)"
        if r.status == 'resolved':
            signal_strength = "0% (Deactivated)"
        elif hash_val % 3 == 0:
            signal_strength = "45% (Degraded - Canopy)"
            
        squads = ["Rapid Search Drone Unit", "K9 Canine Handler Squad", "Sector-Alpha Canine Rescue Team", "Medical Responder Squad"]
        closest_squad = squads[hash_val % len(squads)]
        
        d = r.to_dict()
        d.update({
            "lat": lat,
            "lng": lng,
            "perimeter_radius": perimeter_radius,
            "signal_strength": signal_strength,
            "closest_squad": closest_squad
        })
        radar_data.append(d)

    volunteer_data = []
    for v in volunteers:
        sector_lower = v.sector.lower()
        if "f-7" in sector_lower:
            v_lat, v_lng = 33.72, 73.05
        elif "f-11" in sector_lower:
            v_lat, v_lng = 33.68, 73.01
        elif "g-10" in sector_lower:
            v_lat, v_lng = 33.67, 73.03
        elif "h-9" in sector_lower:
            v_lat, v_lng = 33.65, 73.04
        else:
            v_lat, v_lng = 33.69, 73.03

        # Add a tiny deterministic random offset using their ID so they scatter beautifully
        v_lat += ((v.id % 7 - 3) * 0.005)
        v_lng += ((v.id % 9 - 4) * 0.005)

        d = v.to_dict()
        d.update({
            "lat": v_lat,
            "lng": v_lng
        })
        volunteer_data.append(d)
        
    return success_response(data={
        "coordinates": radar_data,
        "volunteers": volunteer_data
    })


@mobilization_bp.route("/volunteers/<int:volunteer_id>", methods=["PUT"])
@login_required
def admin_edit_volunteer(volunteer_id):
    """Edit search responder volunteer details (Admin only)."""
    if not current_user.is_admin:
        raise APIError("Admin access required", 403)
        
    volunteer = Volunteer.query.get_or_404(volunteer_id)
    data = request.get_json() or {}
    
    updates = {}
    if 'name' in data:
        updates['name'] = data['name'].strip()
    if 'email' in data:
        email = data['email'].strip()
        if email != volunteer.email:
            existing = Volunteer.query.filter_by(email=email).first()
            if existing:
                raise APIError("A volunteer with this email address is already registered.")
        updates['email'] = email
    if 'phone' in data:
        updates['phone'] = data['phone'].strip()
    if 'sector' in data:
        updates['sector'] = data['sector'].strip()
    if 'role' in data:
        updates['role'] = data['role'].strip()
    if 'status' in data:
        updates['status'] = data['status'].strip()
        
    volunteer.update(**updates)
    logger.info(f"Admin {current_user.username} modified responder {volunteer.name} (ID: {volunteer.id})")
    return success_response(data=volunteer.to_dict(), message="Search responder details updated successfully")


@mobilization_bp.route("/volunteers/<int:volunteer_id>", methods=["DELETE"])
@login_required
def admin_delete_volunteer(volunteer_id):
    """Remove a ground search responder volunteer permanently (Admin only)."""
    if not current_user.is_admin:
        raise APIError("Admin access required", 403)
        
    volunteer = Volunteer.query.get_or_404(volunteer_id)
    name = volunteer.name
    volunteer.delete()
    logger.info(f"Admin {current_user.username} permanently retired ground responder {name} (ID: {volunteer_id})")
    return success_response(message="Search responder retired and purged from database registry")
