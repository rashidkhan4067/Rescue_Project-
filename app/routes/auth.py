"""
Authentication routes for the Rescue Project Advanced application.
Handles user registration, login, and logout.
"""
from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from ..forms import RegistrationForm, LoginForm
import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    """Handle user registration."""
    from .. import db  # Deferred import
    from ..models import User  # Deferred import
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data, method="pbkdf2:sha256")
        user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        try:
            db.session.add(user)
            db.session.commit()
            logger.info(f"User registered: {form.username.data}")
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for("auth.login"))
        except Exception as e:
            db.session.rollback()
            logger.error(f"Registration failed for {form.username.data}: {str(e)}")
            flash(f"Registration failed: {str(e)}", "error")
    return render_template("register.html", form=form)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """Handle user login."""
    from ..models import User  # Deferred import
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            logger.info(f"User logged in: {form.username.data}")
            flash("Logged in successfully!", "success")
            return redirect(url_for("main.dashboard"))
        logger.warning(f"Login failed for {form.username.data}")
        flash("Invalid username or password.", "error")
    return render_template("login.html", form=form)

@auth_bp.route("/logout")
@login_required
def logout():
    """Handle user logout."""
    logger.info(f"User logged out: {current_user.username}")
    logout_user()
    flash("Logged out successfully.", "success")
    return redirect(url_for("main.index"))
