
import os

def search_in_file(filepath, query):
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return

    print(f"\nScanning {filepath} for '{query}'...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if query.lower() in line.lower():
                    print(f"{i+1}: {line.strip()}")
    except Exception as e:
        print(f"Error reading file: {e}")

search_in_file("src/services/api.ts", "plants")
search_in_file("backend/main.py", "crud.get_plants")
search_in_file("backend/main.py", "/api/org/plants") # Guessing likely URL
