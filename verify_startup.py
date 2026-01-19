
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

print("Attempting to import backend.dependencies...")
try:
    from backend import dependencies
    print("✅ backend.dependencies imported successfully.")
except Exception as e:
    print(f"❌ Failed to import backend.dependencies: {e}")

print("Attempting to import backend.main...")
try:
    from backend import main
    print("✅ backend.main imported successfully.")
except Exception as e:
    print(f"❌ Failed to import backend.main: {e}")
