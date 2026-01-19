#!/usr/bin/env python3
"""Simulate FastAPI response_model serialization"""
import sys
sys.path.insert(0, '.')

from typing import List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pydantic import TypeAdapter

DATABASE_URL = "sqlite:///backend/data/people_os.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

from backend import crud, schemas

print("Simulating FastAPI response_model=List[schemas.Shift]...")
shifts = crud.get_shifts(db)
print(f"Got {len(shifts)} shifts from CRUD\n")

# Simulate what FastAPI does with response_model
try:
    adapter = TypeAdapter(List[schemas.Shift])
    # FastAPI calls model_validate on each item
    validated = [schemas.Shift.model_validate(s) for s in shifts]
    print(f"Validated {len(validated)} shifts")
    
    # Then dumps with by_alias based on config
    json_data = adapter.dump_json(validated, by_alias=True)
    print(f"\nJSON output (first 500 chars):")
    print(json_data.decode()[:500])
    print(f"\n...total {len(json_data)} bytes")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
