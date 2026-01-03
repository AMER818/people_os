# Python AI Engine (FastAPI)

**Port:** 2000  
**Database:** SQLAlchemy + SQLite  
**Purpose:** AI/Analytics/Heavy Lifting

## Quick Start

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 2000
```

## Current State

**Status:** Transitioning to AI-only role  
**Legacy:** Contains Employee/Candidate CRUD (to be deprecated)  
**Future:** Resume parsing, predictive analytics, sentiment analysis

## Planned Features

- Resume parsing (NLP)
- Candidate auto-scoring
- Payroll forecasting
- Attendance predictions

## API Documentation

Interactive docs: `http://localhost:2000/docs`

## Dependencies

See `requirements.txt`:
- fastapi
- uvicorn
- sqlalchemy
- pydantic
