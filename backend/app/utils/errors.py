"""
Centralized exception classes for the Rescue Project application.
Defines clean, robust error representations.
"""

class APIError(Exception):
    """Custom exception class to raise unified API errors with specific status codes."""
    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details
