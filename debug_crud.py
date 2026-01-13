import sys
import os
import inspect

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from backend import crud
    print(f"Function: {crud.get_system_flags}")
    print(f"Signature: {inspect.signature(crud.get_system_flags)}")
    print(f"File: {inspect.getfile(crud.get_system_flags)}")
except Exception as e:
    print(f"Error: {e}")
