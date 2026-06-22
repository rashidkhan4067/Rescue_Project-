"""Initialize database tables and add initial data if needed."""
from app import create_app, db
from app.models import User, Volunteer
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

            # Seed mock volunteers
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
                logger.info("Mock search volunteers seeded successfully")

        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise

if __name__ == "__main__":
    init_db()
