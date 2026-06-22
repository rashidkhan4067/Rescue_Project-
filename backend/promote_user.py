from app import create_app
from app.models import User

app = create_app()
with app.app_context():
    user = User.query.filter_by(email="rashidkhang4067@gmail.com").first()
    if user:
        user.update(is_admin=True)
        print(f"SUCCESS: User {user.username} ({user.email}) has been successfully promoted to Administrator.")
    else:
        print("ERROR: User not found in database.")
