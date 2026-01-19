import requests

BASE_URL = "http://localhost:8000/api"

# 1. Login using JSON (LoginRequest schema)
login_resp = requests.post(
    f"{BASE_URL}/auth/login", 
    json={"username": "admin", "password": "admin"}
)

print(f"Login Status: {login_resp.status_code}")
if login_resp.status_code != 200:
    print(f"Login Failed: {login_resp.text}")
    exit(1)

token = login_resp.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
print("Login OK")

# 2. Get Grades to find a valid grade_id
grades_resp = requests.get(f"{BASE_URL}/grades", headers=headers)
print(f"Grades Status: {grades_resp.status_code}")
if grades_resp.status_code == 200:
    grades = grades_resp.json()
    if grades:
        grade_id = grades[0].get("id")
        print(f"Using Grade ID: {grade_id}")
    else:
        print("No grades found!")
        grade_id = "FAKE-GRADE"
else:
    print(f"Grades Error: {grades_resp.text}")
    grade_id = "FAKE-GRADE"

# 3. Create Designation
payload = {
    "name": "API Test Designation",
    "gradeId": grade_id,
    "isActive": True
}
print(f"Payload: {payload}")

desig_resp = requests.post(f"{BASE_URL}/designations", json=payload, headers=headers)
print(f"Create Designation Status: {desig_resp.status_code}")
print(f"Response: {desig_resp.text}")
