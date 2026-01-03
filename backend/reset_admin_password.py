import sys
import os
import bcrypt

# Add parent directory to path to allow importing backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from backend.database import SessionLocal
from backend import models

def reset_password():
    db = SessionLocal()
    try:
        user = db.query(models.DBUser).filter(models.DBUser.username == "admin").first()
        if not user:
            print("User 'admin' not found!")
            return

        password = "admin123"
        pwd_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

        user.password_hash = hashed_password
        db.commit()
        print(f"Password for 'admin' reset to '{password}'")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_password()
