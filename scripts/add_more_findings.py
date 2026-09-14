import json

new_findings = [
    {
        "endpoint": "/auth/logout",
        "category": "auth",
        "documented": "POST /auth/logout invalidates the current token server side",
        "actual": "Server does not invalidate tokens server-side. Response states 'tokens are stateless; discard them client side' and the token remains fully valid for subsequent requests",
        "how_found": "Called POST /auth/logout and then immediately reused the same Bearer token on GET /v1/listings, which succeeded with HTTP 200",
        "impact": "Medium - server-side revocation does not exist; client must actively purge tokens on logout",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "min_price (Rupees, inclusive) and max_price (Rupees, inclusive) query parameters filter listings by price range",
        "actual": "Both min_price and max_price parameters are quietly ignored by the server, returning all 4082 total listings unfiltered",
        "how_found": "Called GET /v1/listings?min_price=10000000 and GET /v1/listings?max_price=5000000; both returned total: 4082",
        "impact": "High - price range filtering must be executed client-side",
        "evidence": []
    },
    {
        "endpoint": "/v1/projects",
        "category": "units",
        "documented": "price_min and price_max are in rupees",
        "actual": "In 348 projects, price_min is given in Lakhs while price_max is given in Crores, causing price_min to appear numerically larger than price_max",
        "how_found": "Inspected price_min and price_max pairs across all 470 projects; found 348 instances where price_min > price_max due to mismatched units",
        "impact": "High - displaying price ranges requires multi-unit normalization (detecting Lakhs vs Crores)",
        "evidence": ["P20001", "P20002", "P20003", "P20005", "P20006", "P20007", "P20008", "P20009", "P20010", "P20011"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "timestamps",
        "documented": "posted_at timestamps are in ISO 8601, UTC, Z suffix for historical listings prior to reference moment 2026-09-10",
        "actual": "10 listing records contain impossible future timestamps with dates in late 2026 and 2027 (up to 2027-06-06)",
        "how_found": "Filtered all 4400 listings for posted_at greater than reference moment 2026-09-10T00:00:00+05:30",
        "impact": "Medium - chronological sorting and date filtering can display listings with future dates",
        "evidence": ["DWE-2000604", "MAG-2003104", "SQU-2001539", "100-2000986", "100-2002675", "SQU-2000830", "DWE-2000092", "MAG-2000690", "ZER-2000942", "100-2002737"]
    },
    {
        "endpoint": "/v1/listings",
        "category": "fraud",
        "documented": "is_verified means our operations team has checked the listing",
        "actual": "535 out of 818 fake lead-generation listings (sharing phone numbers across 10+ properties) are marked is_verified: true",
        "how_found": "Cross-referenced identified fake listing IDs against the is_verified boolean flag",
        "impact": "High - is_verified badge is unreliable and cannot be trusted as an authenticity guarantee",
        "evidence": ["SQU-2001771", "MAG-2003517", "100-2001337", "DWE-2000875", "ZER-2002033", "100-2001777", "ZER-2000787", "ZER-2002577", "ZER-2003666", "SQU-2001099"]
    },
    {
        "endpoint": "/v1/rentals",
        "category": "pagination",
        "documented": "total is the exact number of records matching your filters",
        "actual": "total field on /v1/rentals reports 1531, while paginating to the end yields 1650 retrievable records (119 records uncounted)",
        "how_found": "Paged all /v1/rentals records using offset pagination and counted actual received records against total field",
        "impact": "Medium - pagination loops bounded by total terminate early, missing 119 rental listings",
        "evidence": []
    },
    {
        "endpoint": "/v1/projects",
        "category": "pagination",
        "documented": "total is the exact number of records matching your filters",
        "actual": "total field on /v1/projects reports 436, while paginating to the end yields 470 retrievable records (34 records uncounted)",
        "how_found": "Paged all /v1/projects records using offset pagination and counted actual received records against total field",
        "impact": "Medium - pagination loops bounded by total terminate early, missing 34 project records",
        "evidence": []
    }
]

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

existing = {(f['endpoint'], f['category'], f['documented'][:30]) for f in sub['findings']}
added = 0
for nf in new_findings:
    key = (nf['endpoint'], nf['category'], nf['documented'][:30])
    if key not in existing:
        sub['findings'].append(nf)
        added += 1

with open('submission.json', 'w', encoding='utf-8') as f:
    json.dump(sub, f, indent=2)

print(f"Added {added} new findings. Total findings in submission.json: {len(sub['findings'])}")
