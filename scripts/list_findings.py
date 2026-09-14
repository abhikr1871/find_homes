import json

with open('submission.json', 'r', encoding='utf-8') as f:
    sub = json.load(f)

print(f"Total findings: {len(sub['findings'])}")
for i, f in enumerate(sub['findings']):
    print(f"{i+1}. [{f['category']}] {f['endpoint']}: {f['documented'][:45]} -> {f['actual'][:45]}")
