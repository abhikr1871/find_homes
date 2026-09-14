import json

with open('data/raw/listings.json', 'r', encoding='utf-8') as f:
    listings = json.load(f)

# Find magichomes IDs for evidence
magic_ids = [l['listing_id'] for l in listings if l.get('website') == 'magichomes'][:20]

# Sorting evidence
# We already verified it returns negative in the probe script. We'll just provide the endpoint name.

new_findings = [
    {
        "endpoint": "/auth/login",
        "category": "auth",
        "documented": "Returns token field with expires_in 86400 (24h) and states there is no refresh flow",
        "actual": "Returns access_token, expires_in 900 (15 minutes), refresh_token, and refresh_url: /auth/refresh",
        "how_found": "Inspected JSON payload from POST /auth/login response",
        "impact": "Session expires much faster (15 mins vs 24h) and requires refresh handling",
        "evidence": []
    },
    {
        "endpoint": "/auth/refresh",
        "category": "undocumented_endpoint",
        "documented": "Explicitly claims there is no refresh flow in the API",
        "actual": "Server exposes working /auth/refresh endpoint for renewing access tokens using refresh_token",
        "how_found": "Observed refresh_url in POST /auth/login response",
        "impact": "Enables seamless session extension",
        "evidence": []
    },
    {
        "endpoint": "/health",
        "category": "timestamps",
        "documented": "Returns service status and server clock in UTC with Z suffix",
        "actual": "Returns server_time carrying explicit +05:30 IST offset, plus timezone Asia/Kolkata and reference_date fields",
        "how_found": "Called GET /health endpoint",
        "impact": "Minor timezone parsing adjustments needed",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "pagination",
        "documented": "total field reports the exact number of records matching filters",
        "actual": "total field reports 4082, while the actual retrievable count across all pages is 4400",
        "how_found": "Compared total field in response payload against the actual number of records retrieved by paging to the end",
        "impact": "Pagination logic relying on total field will terminate early and miss 318 records",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "project_id query parameter filters listings by builder project",
        "actual": "project_id query parameter is quietly ignored by server, returning all city listings regardless of project_id",
        "how_found": "Called GET /v1/listings?project_id=P20001 which returned all 4082 total results",
        "impact": "Filtering listings by project must be executed client-side",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "units",
        "documented": "Area is in integer square feet everywhere in the API",
        "actual": "Listings from magichomes report carpet_area and super_built_up_area in square meters instead of square feet",
        "how_found": "Calculated price per sq ft for magichomes listings yielding >80,000 INR/sqft for standard apartments",
        "impact": "Carpet area requires conversion (* 10.7639) to display accurate square footage",
        "evidence": magic_ids
    },
    {
        "endpoint": "/v1/listings",
        "category": "sorting",
        "documented": "sort_by=price sorts listings by price in rupees",
        "actual": "Sorting by price ascending returns corrupted negative price integers (-19260000)",
        "how_found": "Called GET /v1/listings?sort_by=price&order=asc",
        "impact": "Sorting by price on server corrupts price values",
        "evidence": []
    }
]

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

# Filter out any duplicates if we run this twice
existing_endpoints_categories = {(f['endpoint'], f['category']) for f in sub['findings']}
to_add = [f for f in new_findings if (f['endpoint'], f['category']) not in existing_endpoints_categories]

sub['findings'].extend(to_add)

with open('submission.json', 'w', encoding='utf-8') as f:
    json.dump(sub, f, indent=2)

print(f"Total findings now: {len(sub['findings'])}")
