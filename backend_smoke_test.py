
import sys
import os

# Add the project root to the python path
sys.path.append(os.getcwd())

try:
    print("Attempting to import backend.main...")
    from backend import main
    print("✅ Successfully imported backend.main")
    
    print("Attempting to import backend.crud...")
    from backend import crud
    print("✅ Successfully imported backend.crud")
    
    print("Attempting to import backend.schemas...")
    from backend import schemas
    print("✅ Successfully imported backend.schemas")
    
    print("All backend modules loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load backend modules: {e}")
    sys.exit(1)
