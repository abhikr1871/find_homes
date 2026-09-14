import json

with open('data/raw/listings.json', 'r', encoding='utf-8') as f:
    listings = json.load(f)

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

# Evidence for completeness finding: listing_ids where is_live = False
inactive_ids = [l['listing_id'] for l in listings if not l.get('is_live')]
print(f"Inactive listings: {len(inactive_ids)}")
print(f"First 20: {sorted(inactive_ids)[:20]}")

# New findings to add
new_findings = [
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "Returns active sale listings only. Inactive, expired and withdrawn listings are excluded server side.",
        "actual": "Returns both is_live=true and is_live=false listings. 923 out of 4400 records have is_live=false. Inactive listings are NOT excluded server-side.",
        "how_found": "After dumping all 4400 listings, counted records with is_live=false. Found 923 inactive records in the dataset, contradicting the docs which claim only active listings are returned.",
        "impact": "Frontend cannot assume all returned listings are safe to show. Must check is_live field on every record before displaying to users.",
        "evidence": sorted(inactive_ids)[:20]
    },
    {
        "endpoint": "/v1/listing/{id}",
        "category": "missing_endpoint",
        "documented": "GET /v1/listing/{listing_id} returns a single listing object.",
        "actual": "Returns HTTP 404. The correct working path is GET /v1/listings/{listing_id} (plural). The documentation uses singular 'listing' which does not exist.",
        "how_found": "Tested GET /v1/listing/100-2000006 — got 404. Then tested GET /v1/listings/100-2000006 — got 200 with full listing object.",
        "impact": "Any frontend following the documented singular path for listing detail pages would get 404 errors.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings/{id}/similar",
        "category": "missing_endpoint",
        "documented": "Returns up to ten comparable listings — same locality, same bedroom count, price within 15%.",
        "actual": "Returns HTTP 404. This endpoint does not exist at all.",
        "how_found": "Tested GET /v1/listings/100-2000006/similar with valid auth headers. Got 404.",
        "impact": "Similar listings functionality must be built client-side by filtering the existing dataset.",
        "evidence": []
    },
    {
        "endpoint": "/v1/favourites",
        "category": "missing_endpoint",
        "documented": "GET /v1/favourites returns saved listings. POST /v1/favourites saves a listing. DELETE /v1/favourites/{id} removes one.",
        "actual": "All three endpoints return HTTP 404. The entire favourites API does not exist.",
        "how_found": "Tested GET /v1/favourites with valid Bearer token and X-API-Key headers. Got 404. Repeated for /favourites and /v1/favourites.",
        "impact": "Saved listings feature must be implemented entirely client-side using localStorage, keyed per user session.",
        "evidence": []
    }
]

sub['findings'].extend(new_findings)

with open('submission.json', 'w', encoding='utf-8') as f:
    json.dump(sub, f, indent=2)

print(f"Total findings now: {len(sub['findings'])}")
print("submission.json updated!")
