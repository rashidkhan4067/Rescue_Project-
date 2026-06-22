"""
Application factory for the Rescue Project Advanced web application.
Initializes Flask app, extensions, and blueprints.
"""
import os
import logging
import datetime
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config
# Blueprints are imported inside create_app() to prevent circular dependencies

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True)

    # Ensure instance and uploads directories exist
    try:
        os.makedirs(app.instance_path, exist_ok=True)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        logger.info("Instance and uploads directories created or verified.")
    except Exception as e:
        logger.error(f"Failed to create directories: {str(e)}")
        raise

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    mail.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints (imported locally to avoid circular dependencies)
    from .routes.auth import auth_bp
    from .routes.cases import cases_bp
    from .routes.mobilization import mobilization_bp
    from .routes.diagnostics import diagnostics_bp
    from .routes.admin import admin_bp
    from .routes.utils import utils_bp
    from .routes.ai_assistant import ai_assistant_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(cases_bp)
    app.register_blueprint(mobilization_bp)
    app.register_blueprint(diagnostics_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(utils_bp, url_prefix="/utils")
    app.register_blueprint(ai_assistant_bp, url_prefix="/utils/ai-assistant")

    # Create database tables and seed initial data
    with app.app_context():
        from .models import User, Report, Volunteer  # Deferred model imports
        from werkzeug.security import generate_password_hash
        try:
            db.create_all()
            logger.info("Database tables created successfully.")

            # Seed default admin user if not exists
            admin = User.query.filter_by(email="admin@example.com").first()
            if not admin:
                admin = User(
                    username="admin",
                    email="admin@example.com",
                    password=generate_password_hash("admin123"),
                    is_admin=True
                )
                db.session.add(admin)
                db.session.commit()
                logger.info("Default admin user seeded successfully.")

            # Seed mock volunteers if table is empty
            if Volunteer.query.count() == 0:
                mock_volunteers = [
                    Volunteer(name="Major Tariq Mahmud", email="major.tariq@pakrescue.org.pk", phone="+92 300 1234567", sector="Sector F-11", role="Search Team Leader", status="Active"),
                    Volunteer(name="Dr. Ayesha Alvi", email="ayesha.alvi@redcrescent.org", phone="+92 312 9876543", sector="Sector G-10", role="Medical First Responder", status="Standby"),
                    Volunteer(name="Sikandar Khan", email="sikandar.k9@pakrescue.org.pk", phone="+92 333 4567890", sector="Sector F-7", role="K9 Dog Handler", status="Active"),
                    Volunteer(name="Zainab Malik", email="zainab.malik@pakrescue.org.pk", phone="+92 321 5556677", sector="Sector G-10", role="Drone Pilot (UAV)", status="Active"),
                    Volunteer(name="Hamza Riaz", email="hamza.riaz@pakrescue.org.pk", phone="+92 345 8889900", sector="Sector H-9", role="Field Navigator", status="Offline")
                ]
                for v in mock_volunteers:
                    db.session.add(v)
                db.session.commit()
                logger.info("Mock search volunteers seeded successfully.")

        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise

    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from .models import User  # Deferred import
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"success": False, "error": "Unauthorized session. Please login."}), 401


    # Error handling
    from .utils.errors import APIError
    from .utils.responses import error_response

    @app.errorhandler(APIError)
    def handle_api_error(error):
        db.session.rollback()
        return error_response(error.message, error.status_code, error.details)

    @app.errorhandler(404)
    def not_found_error(error):
        return error_response("Resource not found", 404)

    @app.errorhandler(403)
    def forbidden_error(error):
        return error_response("Access forbidden", 403)

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        db.session.rollback()
        logger.exception("An unhandled exception occurred in the application.")
        message = str(e) if app.debug else "An unexpected error occurred."
        return error_response(message, 500)

    @app.before_request
    def before_request():
        from flask_login import current_user
        if current_user.is_authenticated:
            current_user.last_seen = datetime.datetime.utcnow()
            try:
                db.session.commit()
            except Exception as e:
                logger.error(f"Error updating last_seen: {str(e)}")
                db.session.rollback()

    return app
