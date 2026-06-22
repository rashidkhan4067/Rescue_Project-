"""
WTForms definitions for the Rescue Project Advanced application.
Handles form validation for user input.
"""
from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from wtforms import (StringField, IntegerField, TextAreaField, FileField,
                    SubmitField, PasswordField, SelectField, BooleanField, DateField, TimeField)
from wtforms.validators import DataRequired, Length, EqualTo, Optional, Email, Regexp, NumberRange

class RegistrationForm(FlaskForm):
    """Form for user registration."""
    username = StringField("Username", validators=[DataRequired(), Length(min=4, max=80)])
    email = StringField("Email", validators=[DataRequired(), Length(max=120)])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField("Confirm Password", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Register")

class LoginForm(FlaskForm):
    """Form for user login."""
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Login")

class ReportForm(FlaskForm):
    """Enhanced form for submitting missing person reports."""

    class Meta:
        csrf = False  # Disable CSRF to ensure form submission works

    # Personal Information
    name = StringField("Full Name", validators=[
        DataRequired(message="Full name is required"),
        Length(min=2, max=100, message="Name must be between 2-100 characters")
    ])
    age = IntegerField("Age", validators=[
        DataRequired(message="Age is required"),
        NumberRange(min=0, max=120, message="Age must be between 0-120 years")
    ])
    gender = SelectField("Gender", choices=[
        ("", "Select gender..."),
        ("Male", "Male"),
        ("Female", "Female"),
        ("Non-binary", "Non-binary"),
        ("Other", "Other"),
        ("Prefer not to say", "Prefer not to say")
    ], validators=[DataRequired(message="Gender selection is required")])

    # Location Information
    area = StringField("Last Known Location", validators=[
        DataRequired(message="Last known location is required"),
        Length(min=3, max=200, message="Location must be between 3-200 characters")
    ])
    last_seen_date = DateField("Last Seen Date", validators=[Optional()])
    last_seen_time = TimeField("Last Seen Time", validators=[Optional()])

    # Description and Photo
    description = TextAreaField("Detailed Description", validators=[
        DataRequired(message="Description is required"),
        Length(min=10, max=2000, message="Description must be between 10-2000 characters")
    ])
    image = FileField("Recent Photo", validators=[
        Optional(),
        FileAllowed(['jpg', 'jpeg', 'png', 'webp'], 'Only image files are allowed (JPG, PNG, WEBP)')
    ])

    submit = SubmitField("Submit Report")

class FeedbackForm(FlaskForm):
    """Form for submitting feedback."""
    subject = StringField("Subject", validators=[DataRequired(), Length(max=100)])
    message = TextAreaField("Message", validators=[DataRequired()])
    submit = SubmitField("Submit Feedback")

class FilterForm(FlaskForm):
    """Form for filtering reports."""
    name = StringField("Name")
    age = IntegerField("Age", validators=[Optional()])
    gender = SelectField("Gender", choices=[("", "Any"), ("Male", "Male"), ("Female", "Female"), ("Other", "Other")])
    area = StringField("Area")
    submit = SubmitField("Filter Reports")

class ProfileForm(FlaskForm):
    """Form for editing user profiles."""
    username = StringField("Username", validators=[
        DataRequired(), 
        Length(min=4, max=80, message="Username must be between 4-80 characters")
    ])
    email = StringField("Email", validators=[
        DataRequired(), 
        Length(max=120),
        Email(message="Please enter a valid email address")
    ])
    avatar = FileField("Profile Picture", validators=[
        Optional(),
        FileAllowed(['jpg', 'jpeg', 'png'], 'Images only (JPEG, PNG)')
    ])
    current_password = PasswordField("Current Password", validators=[Optional()])
    new_password = PasswordField("New Password", validators=[
        Optional(), 
        Length(min=8, message="Password must be at least 8 characters"),
        Regexp(r'(?=.*\d)(?=.*[a-z])(?=.*[A-Z])', 
               message='Password must contain uppercase, lowercase and numbers')
    ])
    confirm_password = PasswordField("Confirm Password", validators=[
        EqualTo("new_password", message="Passwords must match")
    ])
    
    # Social media links
    twitter = StringField("Twitter", validators=[Optional(), Length(max=50)])
    facebook = StringField("Facebook", validators=[Optional(), Length(max=50)])
    linkedin = StringField("LinkedIn", validators=[Optional(), Length(max=50)])
    
    # Notification preferences
    email_notifications = BooleanField("Email Notifications", default=True)
    push_notifications = BooleanField("Push Notifications", default=True)
    
    submit = SubmitField("Save Changes", render_kw={"class": "btn-primary"})


