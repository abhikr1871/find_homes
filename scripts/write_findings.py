import json
import os

def write_findings():
    submission_path = os.path.join(os.path.dirname(__file__), "..", "submission.json")
    
    with open(submission_path, "r", encoding="utf-8") as f:
        sub = json.load(f)
        
    findings = [
        {
            "endpoint": "*",
            "category": "auth",
            "documented": "Append it as a query parameter: GET /v1/listings?api_key=IVY26-XXXXXXXXXXXX",
            "actual": "The API rejects the query parameter with a 401 error and demands the key in the X-API-Key request header.",
            "how_found": "Attempted to fetch listings using the documented query parameter and received a 401 error explicitly stating to use X-API-Key.",
            "impact": "Frontend services must inject the X-API-Key header into every request.",
            "evidence": []
        },
        {
            "endpoint": "/v1/listings",
            "category": "auth",
            "documented": "Returns active sale listings (No mention of requiring a user session token for public data).",
            "actual": "Returns 401 'missing bearer token - log in at POST /auth/login first'. A user session token is strictly required to read listings.",
            "how_found": "Attempted to fetch /v1/listings with just the X-API-Key and received a 401 demanding a Bearer token.",
            "impact": "Frontend must force a user login and attach the Bearer token before it can display any public listings.",
            "evidence": []
        },
        {
            "endpoint": "/auth/login",
            "category": "auth",
            "documented": "Response 200 contains {\"token\": \"eyJhbGciOi...\"}",
            "actual": "Response 200 contains {\"access_token\": \"...\"}, the 'token' key does not exist.",
            "how_found": "Logged in using demo credentials and printed the response keys, finding 'access_token' instead of 'token'.",
            "impact": "Frontend auth context must extract credentials from 'access_token' or it will crash during login flow.",
            "evidence": []
        },
        {
            "endpoint": "*",
            "category": "pagination",
            "documented": "Every collection endpoint takes page and limit. limit default 20 Maximum 200.",
            "actual": "The endpoint strictly uses 'offset' instead of 'page', and hard-caps the return limit to 50 records regardless of the 'limit' parameter provided.",
            "how_found": "Requested page=2 and limit=200, but the API returned offset=0, limit=50, and repeatedly returned the same first 50 records.",
            "impact": "Frontend infinite scrolling must use offset-based logic (0, 50, 100) instead of page-based logic (1, 2, 3).",
            "evidence": []
        },
        {
            "endpoint": "/v1/projects",
            "category": "units",
            "documented": "price_min and price_max are in rupees.",
            "actual": "price_max values are returned in Crores (e.g., 99.8), not raw Rupees.",
            "how_found": "Analyzed the projects.json dump to find the costliest project and found maximum values like 99.8, which is mathematically impossible for real estate in raw Rupees.",
            "impact": "Frontend must multiply project prices by 10,000,000 to display correct Rupee amounts, or label them as Crores to prevent severe user confusion.",
            "evidence": ["P20165", "P20027"]
        }
    ]
    
    sub["findings"] = findings
    
    with open(submission_path, "w", encoding="utf-8") as f:
        json.dump(sub, f, indent=2)
        
    print(f"✅ Successfully wrote {len(findings)} findings to submission.json!")

if __name__ == "__main__":
    write_findings()
