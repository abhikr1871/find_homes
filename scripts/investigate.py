import json, os, requests, sys
from collections import defaultdict, Counter
from dotenv import load_dotenv

load_dotenv('.env.local')
API_KEY = os.getenv('VITE_API_KEY')
BASE_URL = os.getenv('VITE_API_BASE_URL', 'https://solve.ivy.homes')
EMAIL = 'demo1@ivy.homes'
PASSWORD = os.getenv('VITE_DEMO_PASSWORD', 'b2ad1202e9')

headers_base = {'X-API-Key': API_KEY}

# Login
r = requests.post(f'{BASE_URL}/auth/login', json={'email': EMAIL, 'password': PASSWORD}, headers=headers_base)
token = r.json()['access_token']
headers = {'X-API-Key': API_KEY, 'Authorization': f'Bearer {token}'}

print("=== 1. CHECK /v1/analytics/summary ===")
r = requests.get(f'{BASE_URL}/v1/analytics/summary', headers=headers)
print(f"Status: {r.status_code}")
print(r.text[:500])

print("\n=== 2. CHECK /v1/analytics/ ===")
r = requests.get(f'{BASE_URL}/v1/analytics/', headers=headers)
print(f"Status: {r.status_code}")
print(r.text[:500])

print("\n=== 3. CHECK /v1/listings FILTERS (locality, furnishing, price) ===")
# Does locality filter work?
r = requests.get(f'{BASE_URL}/v1/listings?locality=Kukatpally&offset=0&limit=50', headers=headers)
data = r.json()
print(f"locality=Kukatpally: got {len(data.get('results',[]))} results, total={data.get('total')}")
if data.get('results'):
    localities = set(x.get('locality') for x in data['results'])
    print(f"  actual localities returned: {localities}")

# Does furnishing filter work?
r = requests.get(f'{BASE_URL}/v1/listings?furnishing=Furnished&offset=0&limit=50', headers=headers)
data = r.json()
if data.get('results'):
    furnishings = set(x.get('furnishing') for x in data['results'])
    print(f"furnishing=Furnished: actual furnishings returned: {furnishings}")

# Does bedroom filter work?
r = requests.get(f'{BASE_URL}/v1/listings?bedroom=2&offset=0&limit=50', headers=headers)
data = r.json()
if data.get('results'):
    bedrooms = set(x.get('bedroom') for x in data['results'])
    print(f"bedroom=2: actual bedrooms returned: {bedrooms}")

print("\n=== 4. FAKE LISTINGS ANALYSIS ===")
with open('data/raw/listings.json', 'r') as f:
    listings = json.load(f)

# Check for duplicate phone numbers (seller fraud indicator)
phone_to_listings = defaultdict(list)
for l in listings:
    phone = l.get('posted_by_contact', '').strip()
    if phone:
        phone_to_listings[phone].append(l['listing_id'])

# Phones appearing in many listings
fraud_candidates = {}
for phone, ids in phone_to_listings.items():
    if len(ids) > 5:  # Suspiciously many
        fraud_candidates[phone] = ids

print(f"Phones appearing >5 times: {len(fraud_candidates)}")
for phone, ids in list(fraud_candidates.items())[:5]:
    print(f"  {phone}: {len(ids)} listings -> {ids[:3]}...")

# Check for identical descriptions
desc_to_listings = defaultdict(list)
for l in listings:
    desc = l.get('description', '').strip()
    if desc:
        desc_to_listings[desc].append(l['listing_id'])

dup_desc = {d: ids for d, ids in desc_to_listings.items() if len(ids) > 1}
print(f"\nDuplicate descriptions: {len(dup_desc)} groups")
for desc, ids in list(dup_desc.items())[:3]:
    print(f"  desc[:50]='{desc[:50]}': {ids[:5]}")

# Check for duplicate (lat, lng) pairs
coords_to_listings = defaultdict(list)
for l in listings:
    lat = round(l.get('latitude', 0), 5)
    lng = round(l.get('longitude', 0), 5)
    if lat and lng:
        coords_to_listings[(lat, lng)].append(l['listing_id'])

dup_coords = {k: v for k, v in coords_to_listings.items() if len(v) > 1}
print(f"\nSame coordinates: {len(dup_coords)} groups")
for coords, ids in list(dup_coords.items())[:3]:
    print(f"  {coords}: {ids[:5]}")

print("\n=== 5. UNIQUE PROPERTIES CHECK ===")
# Check if any listing_id appears twice (duplicates)
all_ids = [l['listing_id'] for l in listings]
id_counts = Counter(all_ids)
dupes = {k: v for k, v in id_counts.items() if v > 1}
print(f"Duplicate listing_ids: {len(dupes)}")

# Check by (apartment_name, locality, floor, bedroom, bathroom)
sig_to_listings = defaultdict(list)
for l in listings:
    sig = (l.get('apartment_name',''), l.get('locality',''), l.get('floor'), l.get('bedroom'), l.get('bathroom'), l.get('carpet_area'))
    sig_to_listings[sig].append(l['listing_id'])

dup_sigs = {k: v for k, v in sig_to_listings.items() if len(v) > 1}
print(f"Same property signature: {len(dup_sigs)} groups")
for sig, ids in list(dup_sigs.items())[:5]:
    print(f"  sig={sig}: {ids}")

print("\n=== DONE ===")
