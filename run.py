"""
Entry point for the Rescue Project Advanced Flask application.
Invokes the application factory to create and run the app.
"""
from app import create_app, db
from flask_migrate import Migrate

if __name__ == "__main__":
    app = create_app()
    migrate = Migrate(app, db)
    app.run(debug=True, host="0.0.0.0", port=5000)
