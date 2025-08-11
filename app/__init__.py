"""
Application factory for the Rescue Project Advanced web application.
Initializes Flask app, extensions, and blueprints.
"""
import os
import logging
import datetime
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from .config import Config
from .routes.auth import auth_bp
from .routes.main import main_bp
from .routes.utils import utils_bp

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
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
    app = Flask(__name__, instance_relative_config=True, template_folder=template_dir, static_folder=static_dir)
    app.config.from_object(Config)

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

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(main_bp)
    app.register_blueprint(utils_bp, url_prefix="/utils")

    # Create database tables
    with app.app_context():
        from .models import User, Report  # Deferred model imports
        try:
            db.create_all()
            logger.info("Database tables created successfully.")
        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise

    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        from .models import User  # Deferred import
        return User.query.get(int(user_id))

    # Error handling
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template("error.html", error_code=404, message="Page not found"), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template("error.html", error_code=500, message="Internal server error"), 500

    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template("error.html", error_code=403, message="Access forbidden"), 403

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
