import requests
import json

try:
    response = requests.get('http://127.0.0.1:8000/api/plants')
    if response.status_code == 401:
        print("Got 401 Unauthorized - API is reachable but requires auth.")
        print("This confirms server is running.")
        # We can't easily get a token without login flow, but if we get 401, the endpoint exists.
        # To test data, we would need a token.
        # However, for 401, we know the endpoint is mounted.
        
        # Let's try to access public endpoints if any, or assume if it's 401 logic is executing.
        pass
    else:
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            print(json.dumps(data, indent=2))
        except:
            print(response.text)
except Exception as e:
    print(f"Error: {e}")
