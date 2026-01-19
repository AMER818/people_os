
import sys
import os
import importlib

# Add the project root to the python path
sys.path.append(os.getcwd())

def test_lazy_loading():
    print("--- Testing Lazy Loading ---")
    
    # 1. Import main
    print("Importing backend.main...")
    from backend import main
    print("✅ backend.main imported.")

    # 2. Check if crud is a proxy
    crud_attr = getattr(main, "crud", None)
    print(f"main.crud type: {type(crud_attr)}")
    if type(crud_attr).__name__ == "LazyProxy":
        print("✅ main.crud is a LazyProxy.")
    else:
        print(f"❌ main.crud is NOT a LazyProxy. It is {type(crud_attr)}")
        sys.exit(1)

    # 3. Check if backend.crud is loaded?
    # It should NOT be loaded if we haven't accessed it yet (unless main.py accessed it, which it shouldn't have)
    # Wait, backend.crud might be loaded by other imports (e.g. schemas might import it? No)
    # But main.py imports schemas, does schemas import crud?
    # Let's check sys.modules
    
    if "backend.crud" in sys.modules:
        print("⚠️ backend.crud is already in sys.modules. Lazy loading might be bypassed by other imports.")
    else:
        print("✅ backend.crud is NOT in sys.modules yet. Lazy loading effective!")

    # 4. Trigger load
    print("Accessing main.crud.get_system_flags...")
    try:
        func = main.crud.get_system_flags
        print(f"✅ Retrieved function: {func}")
    except Exception as e:
        print(f"❌ Failed to access main.crud attribute: {e}")
        sys.exit(1)

    # 5. Check sys.modules again
    if "backend.crud" in sys.modules:
        print("✅ backend.crud is now loaded.")
    else:
        print("❌ backend.crud is STILL NOT loaded after access. Something is wrong.")
        sys.exit(1)

    print("--- Lazy Loading Verification Complete ---")

if __name__ == "__main__":
    test_lazy_loading()
