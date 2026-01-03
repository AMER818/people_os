from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os

app = FastAPI(title="Hunzal AI Engine")

# Configuration
from backend.config_constants import api_config

API_URL = os.getenv("INTERNAL_API_URL", f"http://localhost:{api_config.PORT}/api")


class AttritionPredictionRequest(BaseModel):
    employee_id: str


@app.get("/")
def health_check():
    return {"status": "AI Engine Online", "mode": "API Consumer"}


@app.post("/predict/attrition")
def predict_attrition(request: AttritionPredictionRequest):
    # Fetch Employee Data from Internal API
    try:
        response = requests.get(f"{API_URL}/employees/{request.employee_id}")
        if response.status_code == 404:
            raise HTTPException(
                status_code=404, detail="Employee not found in Core System"
            )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch employee data")

        employee = response.json()

        # Mock Logic: Predict based on tenure or salary
        # In real world, load model here.
        score = 0.2
        risk = "Low"

        if employee.get("status") == "Probation":
            score = 0.6
            risk = "Medium"

        return {
            "employeeId": request.employee_id,
            "attritionRisk": risk,
            "riskScore": score,
            "factors": ["Tenure", "Recent Promotion Status"],
        }

    except requests.exceptions.ConnectionError:
        # Fallback Logic (Audit Requirement)
        return {
            "employeeId": request.employee_id,
            "attritionRisk": "Unknown (System Offline)",
            "riskScore": -1,
            "factors": ["Core System Unavailable - Using Fallback"],
            "fallback": True,
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
