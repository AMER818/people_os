import sqlite3
import bcrypt
import uuid
import datetime

DB_PATH = "backend/data/people_os.db"


def reset_admin():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    username = "admin"
    password = "admin"
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Check if admin exists
    c.execute("SELECT id FROM core_users WHERE username = ?", (username,))
    row = c.fetchone()

    if row:
        print(f"User '{username}' found. Updating password...")
        now = datetime.datetime.now().isoformat()
        c.execute(
            "UPDATE core_users SET password_hash = ?, updated_at = ? "
            "WHERE username = ?",
            (password_hash, now, username)
        )
    else:
        print(f"User '{username}' not found. Creating...")
        user_id = str(uuid.uuid4())
        now = datetime.datetime.now().isoformat()
        c.execute("""
            INSERT INTO core_users (
                id, username, password_hash, role, name, email,
                is_active, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            username,
            password_hash,
            "SystemAdmin",
            "System Administrator",
            "admin@people-os.com",
            1,
            now,
            now
        ))

    conn.commit()
    print(f"✅ User '{username}' password is now '{password}'")
    conn.close()


if __name__ == "__main__":
    reset_admin()
