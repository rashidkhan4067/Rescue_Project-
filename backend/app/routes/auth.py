"""
Authentication routes for the Rescue Project Advanced application.
Handles user registration, login, and logout via REST API.
Dispatches high-fidelity SMTP security alerts, welcome pages, and magic login link coordinates.
"""
import json
import logging
import urllib.request
from flask import Blueprint, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from ..utils.errors import APIError
from ..utils.responses import success_response

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """Handle user registration and dispatch premium welcome emails."""
    from ..models import User
    
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    
    if not username or not email or not password:
        raise APIError("Missing required fields")
        
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        raise APIError("Username or email already exists")

    hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
    user = User(username=username, email=email, password=hashed_password)
    user.save()
    logger.info(f"User registered: {username}")
    
    # Dispatch Welcome Email
    try:
        from ..utils_mail import send_welcome_email
        send_welcome_email(email, username)
    except Exception as mail_err:
        logger.error(f"Welcome email failure for {email}: {str(mail_err)}")
        
    return success_response(message="Registration successful", status_code=201)

@auth_bp.route("/login", methods=["POST"])
def login():
    """Handle user login and dispatch SMTP security signs."""
    from ..models import User
    
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        raise APIError("Missing username or password")

    # Permit login via username OR email
    user = User.query.filter_by(username=username).first() or User.query.filter_by(email=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        logger.info(f"User logged in: {user.username}")
        
        # Dispatch Login Security Alert
        try:
            from ..utils_mail import send_login_alert_email
            ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
            if ip_address and "," in ip_address:
                ip_address = ip_address.split(",")[0].strip()
            user_agent = request.headers.get("User-Agent", "Unknown Device")
            send_login_alert_email(user.email, user.username, ip_address, user_agent)
        except Exception as mail_err:
            logger.error(f"Login alert failure for {user.email}: {str(mail_err)}")

        return success_response(
            data={"user": user.to_dict(exclude=["password"])},
            message="Logged in successfully"
        )
        
    logger.warning(f"Login failed for {username}")
    raise APIError("Invalid username or password", 401)

@auth_bp.route("/logout", methods=["POST", "GET"])
@login_required
def logout():
    """Handle user logout."""
    logger.info(f"User logged out: {current_user.username}")
    logout_user()
    return success_response(message="Logged out successfully")

@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    """Get current user details."""
    return success_response(data={"user": current_user.to_dict(exclude=["password"])})

@auth_bp.route("/google", methods=["POST"])
def google_login():
    """Process Google OAuth login and dispatch corresponding welcome/security alerts."""
    from ..models import User
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        raise APIError("No token provided")
    
    try:
        req = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        with urllib.request.urlopen(req) as resp:
            if resp.status != 200:
                raise APIError("Invalid Google token")
            user_info = json.loads(resp.read().decode())
        
        email = user_info.get('email')
        name = user_info.get('name', '').split('@')[0]
        
        user = User.query.filter_by(email=email).first()
        is_new_user = False
        if not user:
            is_new_user = True
            hashed_password = generate_password_hash("google-sso-random-password", method="pbkdf2:sha256")
            user = User(username=name, email=email, password=hashed_password)
            user.save()
            
        login_user(user)
        
        # Dispatch appropriate emails
        try:
            if is_new_user:
                from ..utils_mail import send_welcome_email
                send_welcome_email(email, name)
            else:
                from ..utils_mail import send_login_alert_email
                ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
                if ip_address and "," in ip_address:
                    ip_address = ip_address.split(",")[0].strip()
                user_agent = request.headers.get("User-Agent", "Unknown Device")
                send_login_alert_email(email, user.username, ip_address, user_agent)
        except Exception as mail_err:
            logger.error(f"Google auth email trigger failure: {str(mail_err)}")

        return success_response(
            data={"user": user.to_dict(exclude=["password"])},
            message="Logged in with Google"
        )
    except Exception as e:
        if isinstance(e, APIError):
            raise
        raise APIError(str(e))

@auth_bp.route("/magic-link/request", methods=["POST"])
def request_magic_link():
    """Generates secure short-lived tokens and sends magic link emails."""
    from ..models import User
    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        raise APIError("Email required")
    
    # Confirm user account exists before sending magic links
    user = User.query.filter_by(email=email).first()
    if not user:
        raise APIError("No registered Rescue account matches this email.", 404)
        
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token = serializer.dumps(email, salt='magic-link-salt')
    
    # Generate link coordinates
    magic_link = f"http://localhost:5173/verify-magic-link?token={token}"
    
    # Dispatch Magic Link email
    try:
        from ..utils_mail import send_magic_link_email
        send_magic_link_email(email, magic_link)
    except Exception as mail_err:
        logger.error(f"Magic link email dispatch failure to {email}: {str(mail_err)}")
        
    logger.info(f"Magic Link Token generated for {email}")
    return success_response(
        data={"demo_token": token},
        message="Magic link sent to your email"
    )

@auth_bp.route("/magic-link/verify", methods=["POST"])
def verify_magic_link():
    """Verifies timed magic link tokens and logins the target user."""
    from ..models import User
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        raise APIError("Token required")
        
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='magic-link-salt', max_age=3600)
    except Exception:
        raise APIError("Invalid or expired magic link")
        
    user = User.query.filter_by(email=email).first()
    if not user:
        raise APIError("User not found", 404)
        
    login_user(user)
    
    # Dispatch security sign-in alert
    try:
        from ..utils_mail import send_login_alert_email
        ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip_address and "," in ip_address:
            ip_address = ip_address.split(",")[0].strip()
        user_agent = request.headers.get("User-Agent", "Unknown Device")
        send_login_alert_email(email, user.username, ip_address, user_agent)
    except Exception as mail_err:
        logger.error(f"Magic link verify sign-in alert failure: {str(mail_err)}")

    return success_response(
        data={"user": user.to_dict(exclude=["password"])},
        message="Logged in via magic link"
    )
