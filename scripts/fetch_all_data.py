import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from the root .env.local file
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("VITE_API_KEY")
BASE_URL = os.getenv("VITE_API_BASE_URL", "https://solve.ivy.homes")

if not API_KEY or API_KEY == "IVY26-XXXXXXXXXXXX":
    print("❌ ERROR: VITE_API_KEY is not set correctly in .env.local")
    print("Please add it like this: VITE_API_KEY=IVY26-YOURKEYHERE")
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
    print(f"✅ Saved health check to {output_path}\n")

def fetch_endpoint(endpoint_path, filename):
    print(f"Fetching {endpoint_path}...")
    page = 1
    limit = 200 # Using the largest safe page size to reduce requests
    all_rows = []
    
    while True:
        url = f"{BASE_URL}{endpoint_path}?api_key={API_KEY}&page={page}&limit={limit}"
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"⚠️ Error {response.status_code} on page {page}: {response.text}")
            # The API guide suggests reading error bodies, as they are "written to be useful"
            break
            
        payload = response.json()
        rows = payload.get("results", [])
        all_rows.extend(rows)
        
        print(f"   -> Fetched page {page} ({len(rows)} records). Total so far: {len(all_rows)}")
        
        if len(rows) == 0:
            break
        
        # Defensive check: sometimes APIs lie about total, or drop rows. 
        # Stop if we fetched fewer than limit, AND we have reached the reported total.
        if len(rows) < limit:
            reported_total = payload.get("total", len(all_rows))
            if len(all_rows) >= reported_total:
                break
        
        page += 1
        
    # Save raw responses to data/raw/
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", filename)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, indent=2)
    print(f"✅ Saved {len(all_rows)} total records to {output_path}\n")

if __name__ == "__main__":
    print(f"Starting Extraction using API Key: {API_KEY[:8]}********\n")
    fetch_health()
    fetch_endpoint("/v1/listings", "listings.json")
    fetch_endpoint("/v1/rentals", "rentals.json")
    fetch_endpoint("/v1/projects", "projects.json")
    print("🎉 Phase 1 & 2 Data extraction complete!")
