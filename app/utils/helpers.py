"""
Helper functions for the Rescue Project Advanced application.
Contains utility functions for file validation and other common tasks.
"""
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image
import logging

logger = logging.getLogger(__name__)

def allowed_file(filename, allowed_extensions={"png", "jpg", "jpeg", "webp"}):
    """Check if a file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions

def validate_image_file(file):
    """Validate uploaded image file."""
    if not file or not file.filename:
        return False, "No file selected"

    if not allowed_file(file.filename):
        return False, "Invalid file type. Only JPG, PNG, and WEBP files are allowed."

    # Check file size (10MB limit)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer

    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        return False, f"File size too large. Maximum size is {max_size // (1024*1024)}MB."

    return True, "Valid file"

def save_uploaded_file(file):
    """Save uploaded file with enhanced validation and processing."""
    try:
        # Validate file
        is_valid, message = validate_image_file(file)
        if not is_valid:
            logger.error(f"File validation failed: {message}")
            return None

        # Generate secure filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{file_extension}"

        # Ensure upload directory exists
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'static/uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder, exist_ok=True)

        file_path = os.path.join(upload_folder, filename)

        # Save original file
        file.save(file_path)

        # Optimize image
        try:
            optimize_image(file_path)
        except Exception as e:
            logger.warning(f"Image optimization failed: {str(e)}")
            # Continue even if optimization fails

        logger.info(f"File uploaded successfully: {filename}")
        return filename

    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        return None

def optimize_image(file_path, max_width=1200, max_height=1200, quality=85):
    """Optimize uploaded image for web display."""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # Resize if too large
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

            # Save optimized image
            img.save(file_path, optimize=True, quality=quality)

    except Exception as e:
        logger.error(f"Image optimization failed for {file_path}: {str(e)}")
        raise

def format_file_size(size_bytes):
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0 B"

    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1

    return f"{size_bytes:.1f} {size_names[i]}"