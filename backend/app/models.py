"""
Database models for the Rescue Project Advanced application.
Defines User and Report entities using SQLAlchemy.
"""
import datetime as dt
from flask_login import UserMixin
from . import db

class BaseModelMixin:
    """Helper methods for database models to perform secure lifecycle transactions."""
    def save(self):
        """Save the entity instance to the database."""
        db.session.add(self)
        db.session.commit()
        return self

    def delete(self):
        """Delete the entity instance from the database."""
        db.session.delete(self)
        db.session.commit()

    def update(self, **kwargs):
        """Update multiple attributes dynamically and commit."""
        for key, val in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, val)
        return self.save()

class SerializerMixin:
    """Automates clean, lightweight dictionary serialization for database entities."""
    def to_dict(self, exclude=None):
        exclude = exclude or []
        result = {}
        for column in self.__table__.columns:
            if column.name in exclude:
                continue
            val = getattr(self, column.name)
            if isinstance(val, (dt.datetime, dt.date)):
                result[column.name] = val.isoformat()
            elif isinstance(val, dt.time):
                result[column.name] = val.strftime('%H:%M:%S')
            else:
                result[column.name] = val
        return result

class User(db.Model, UserMixin, BaseModelMixin, SerializerMixin):
    """User model for authentication and report association."""
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=dt.datetime.utcnow)
    
    # Social media fields
    twitter = db.Column(db.String(50))
    facebook = db.Column(db.String(50))
    linkedin = db.Column(db.String(50))
    
    # Notification preferences
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<User {self.username}>"

class Report(db.Model, BaseModelMixin, SerializerMixin):
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
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

    # Status tracking
    status = db.Column(db.String(20), default="active")  # active, resolved, pending, urgent

    # Physical Attributes
    height = db.Column(db.String(50), nullable=True)
    weight = db.Column(db.String(50), nullable=True)
    hair = db.Column(db.String(50), nullable=True)
    eyes = db.Column(db.String(50), nullable=True)
    clothing = db.Column(db.String(200), nullable=True)
    marks = db.Column(db.String(200), nullable=True)
    
    # Severity Level
    severity = db.Column(db.String(50), default="Standard Search") # Advisory, Standard Search, Critical Amber Alert

    def __repr__(self):
        return f"<Report {self.name}>"

class Volunteer(db.Model, BaseModelMixin, SerializerMixin):
    """Ground search volunteer model for geolocated emergency mobilization."""
    __tablename__ = "volunteer"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    sector = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default="Standby")  # Active, Standby, Offline
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow)

    def __repr__(self):
        return f"<Volunteer {self.name}>"

