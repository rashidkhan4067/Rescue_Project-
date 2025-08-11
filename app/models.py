"""
Database models for the Rescue Project Advanced application.
Defines User and Report entities using SQLAlchemy.
"""
from datetime import datetime
from flask_login import UserMixin
from . import db

class User(db.Model, UserMixin):
    """User model for authentication and report association."""
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Social media fields
    twitter = db.Column(db.String(50))
    facebook = db.Column(db.String(50))
    linkedin = db.Column(db.String(50))
    
    # Notification preferences
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<User {self.username}>"

class Report(db.Model):
    """Enhanced report model for missing person details."""
    __tablename__ = "report"
    id = db.Column(db.Integer, primary_key=True)

    # Personal Information
    name = db.Column(db.String(100), nullable=False, index=True)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)

    # Location Information
    area = db.Column(db.String(200), nullable=False, index=True)
    last_seen_date = db.Column(db.Date, nullable=True)
    last_seen_time = db.Column(db.Time, nullable=True)

    # Description and Media
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(100), nullable=True)

    # Metadata
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="reports")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Status tracking
    status = db.Column(db.String(20), default="active")  # active, resolved, pending, urgent

    def __repr__(self):
        return f"<Report {self.name}>"
