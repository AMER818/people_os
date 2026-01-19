
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

try:
    from backend.domains.core import models
    print("Successfully imported backend.domains.core.models")
    
    if hasattr(models, 'DBSystemFlags'):
        print("✅ DBSystemFlags found in backend.domains.core.models")
    else:
        print("❌ DBSystemFlags NOT found in backend.domains.core.models")
        
    if hasattr(models, 'DBNotificationSettings'):
        print("✅ DBNotificationSettings found in backend.domains.core.models")
    else:
         print("❌ DBNotificationSettings NOT found")

except Exception as e:
    print(f"❌ Import failed: {e}")
