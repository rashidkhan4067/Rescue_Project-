"""
Centralized JSON response wrappers for the Rescue Project application.
Ensures unified API structures across all blueprints.
"""
from flask import jsonify

def success_response(data=None, message=None, status_code=200):
    """Generate standard API success JSON response."""
    response = {"success": True}
    if message:
        response["message"] = message
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code

def error_response(message, status_code=400, details=None):
    """Generate standard API error JSON response."""
    response = {
        "success": False,
        "error": message
    }
    if details is not None:
        response["details"] = details
    return jsonify(response), status_code
