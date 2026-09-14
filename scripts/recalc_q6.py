import json

with open('data/raw/listings.json', 'r', encoding='utf-8') as f:
    listings = json.load(f)

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

corrupt_ids = set(sub['answers']['corrupt_listing_ids'])
fake_ids = set(sub['answers']['fake_listing_ids'])
exclude = corrupt_ids | fake_ids

filtered = [l for l in listings if l.get('is_live') and l.get('bedroom') == 2 and l['listing_id'] not in exclude]
print(f"2BHK live after excluding corrupt+fake: {len(filtered)}")

prices_per_sqft = []
for l in filtered:
    if l.get('carpet_area') and l.get('price') and l['carpet_area'] > 0:
        prices_per_sqft.append(l['price'] / l['carpet_area'])

avg = round(sum(prices_per_sqft) / len(prices_per_sqft), 2)
old_val = sub['answers']['avg_price_per_sqft_2bhk']
print(f"avg_price_per_sqft_2bhk corrected: {avg}")
print(f"Previous value was: {old_val}")
print(f"Difference: {round(avg - old_val, 2)}")

# Update submission.json
sub['answers']['avg_price_per_sqft_2bhk'] = avg
with open('submission.json', 'w', encoding='utf-8') as f:
    json.dump(sub, f, indent=2)
print("submission.json updated!")
