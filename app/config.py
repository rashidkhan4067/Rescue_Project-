"""
Configuration settings for the Rescue Project Advanced application.
Loads sensitive data from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(24).hex())
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # Construct the database path and normalize slashes
    DB_PATH = os.path.join(BASE_DIR, "..", "instance", "rescue.db").replace("\\", "/")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "static", "uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")