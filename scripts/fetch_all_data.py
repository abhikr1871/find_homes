import os
import json
import requests
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("VITE_API_KEY")
BASE_URL = os.getenv("VITE_API_BASE_URL", "https://solve.ivy.homes")
DEMO_PASSWORD = os.getenv("VITE_DEMO_PASSWORD")

if not API_KEY or API_KEY == "IVY26-XXXXXXXXXXXX":
    print("ERROR: VITE_API_KEY is not set correctly in .env.local")
    exit(1)

def fetch_health():
    print("Fetching /health...")
    url = f"{BASE_URL}/health"
    response = requests.get(url)
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "health.json")
    try:
        data = response.json()
    except Exception:
        data = {"raw_text": response.text, "status_code": response.status_code}
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"[OK] Saved health check to {output_path}\n")

def login():
    print("Logging in to get Bearer token...")
    url = f"{BASE_URL}/auth/login"
    # Even auth/login might need the API key to identify our city
    headers = {"X-API-Key": API_KEY}
    payload = {"email": "demo1@ivy.homes", "password": DEMO_PASSWORD}
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        print(f"[FATAL] Login failed: {response.status_code} - {response.text}")
        exit(1)
        
    data = response.json()
    print(f"Login Response keys: {list(data.keys())}")
    
    # Try different common keys since the docs lied about 'token'
    token = data.get("token") or data.get("access_token") or data.get("session_token")
    if not token:
        print(f"[FATAL] Could not find token in response! Raw data: {data}")
        exit(1)
        
    print("[OK] Logged in successfully.\n")
    return token

def fetch_endpoint(endpoint_path, filename, token):
    print(f"Fetching {endpoint_path}...")
    offset = 0
    limit = 50 # API capped at 50 anyway
    all_rows = []
    
    while True:
        url = f"{BASE_URL}{endpoint_path}?offset={offset}&limit={limit}"
        headers = {
            "X-API-Key": API_KEY,
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print(f"[WARN] Error {response.status_code} at offset {offset}: {response.text}")
            break
            
        payload = response.json()
        rows = payload.get("results", [])
        all_rows.extend(rows)
        
        print(f"   -> Fetched offset {offset} ({len(rows)} records). Total so far: {len(all_rows)}")
        
        if not payload.get("has_more", False) or len(rows) == 0:
            break
            
        offset += limit
        
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", filename)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, indent=2)
    print(f"[OK] Saved {len(all_rows)} total records to {output_path}\n")

if __name__ == "__main__":
    print(f"Starting Extraction using API Key: {API_KEY[:8]}********\n")
    fetch_health()
    token = login()
    fetch_endpoint("/v1/listings", "listings.json", token)
    fetch_endpoint("/v1/rentals", "rentals.json", token)
    fetch_endpoint("/v1/projects", "projects.json", token)
    print("[DONE] Phase 1 & 2 Data extraction complete!")
