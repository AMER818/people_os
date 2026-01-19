#!/usr/bin/env python3
"""Test script to verify shifts API endpoint"""
import sqlite3
import os

# Find correct DB path
db_path = "backend/data/people_os.db"
if not os.path.exists(db_path):
    db_path = "data/people_os.db"

print(f"Using DB: {db_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# List tables
print("\n=== Tables in Database ===")
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
for table in c.fetchall():
    print(f"  - {table[0]}")

# Check users table
print("\n=== Users ===")
try:
    c.execute("SELECT username, role FROM core_users LIMIT 5")
    print("core_users:", c.fetchall())
except:
    pass

# Check shifts
print("\n=== Shifts ===")
c.execute("SELECT id, name, code, start_time, end_time, color FROM hcm_shifts")
shifts = c.fetchall()
for s in shifts:
    print(f"  {s}")

conn.close()
print(f"\nTotal shifts: {len(shifts)}")
