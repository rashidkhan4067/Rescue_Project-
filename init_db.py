"""Initialize database tables and add initial data if needed."""
from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash
import logging

logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database with tables and initial data."""
    app = create_app()
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            logger.info("Database tables created successfully")

            # Check if admin user exists
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
                logger.info("Admin user created successfully")

        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise

if __name__ == "__main__":
    init_db()
