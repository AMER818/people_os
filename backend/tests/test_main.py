from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code in [200, 404]  # Basic availability check
