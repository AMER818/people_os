import sqlite3
import bcrypt

conn = sqlite3.connect("backend/data/people_os.db")
c = conn.cursor()

# Check current hash
c.execute("SELECT username, password_hash FROM core_users WHERE username = 'admin'")
row = c.fetchone()
print(f"Username: {row[0]}")
print(f"Current Hash: {row[1]}")

# Reset password to 'admin'
new_hash = bcrypt.hashpw("admin".encode(), bcrypt.gensalt()).decode()
c.execute("UPDATE core_users SET password_hash = ? WHERE username = 'admin'", (new_hash,))
conn.commit()
print(f"Password reset to 'admin'. New hash: {new_hash}")

conn.close()
