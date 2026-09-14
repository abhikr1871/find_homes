import json

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

ALLOWED_CATEGORIES = {
    'auth', 'pagination', 'units', 'filters', 'sorting', 'timestamps',
    'duplicates', 'completeness', 'data_quality', 'fraud', 'consistency',
    'missing_endpoint', 'undocumented_endpoint'
}

print(f"Validating {len(sub['findings'])} findings...")
for i, f in enumerate(sub['findings']):
    cat = f['category']
    assert cat in ALLOWED_CATEGORIES, f"Invalid category: {cat} in finding {i+1}"
    assert 'endpoint' in f and f['endpoint'], f"Missing endpoint in finding {i+1}"
    assert 'documented' in f and f['documented'], f"Missing documented in finding {i+1}"
    assert 'actual' in f and f['actual'], f"Missing actual in finding {i+1}"
    assert 'how_found' in f and f['how_found'], f"Missing how_found in finding {i+1}"
    assert 'impact' in f and f['impact'], f"Missing impact in finding {i+1}"
    assert 'evidence' in f and isinstance(f['evidence'], list), f"Invalid evidence in finding {i+1}"
    assert len(f['evidence']) <= 20, f"Evidence exceeds 20 items ({len(f['evidence'])}) in finding {i+1}"

print("SUCCESS: All findings pass 100% of the Ivy Homes schema rules!")
