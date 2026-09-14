import json
import os
from datetime import datetime, timezone, timedelta

def load_json(filename):
    path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def run_analysis():
    print("Loading raw JSON data...")
    listings = load_json("listings.json")
    rentals = load_json("rentals.json")
    projects = load_json("projects.json")

    # Q1: total_listing_records
    q1 = len(listings)

    # Q4: corrupt_listing_ids
    # Q9: fake_listing_ids
    corrupt_ids = []
    fake_ids = []

    for lst in listings:
        lid = lst.get("listing_id")
        
        # 1. Detect Fakes (Spam/Test listings)
        desc = (lst.get("description") or "").lower()
        name = (lst.get("posted_by_name") or "").lower()
        apt = (lst.get("apartment_name") or "").lower()
        contact = lst.get("posted_by_contact") or ""
        
        is_fake = False
        if "test" in desc or "test" in name or "test" in apt:
            is_fake = True
        # Look for obviously fake phone numbers
        if "9999999999" in contact or "0000000000" in contact or "1234567890" in contact:
            is_fake = True
            
        if is_fake:
            fake_ids.append(lid)
            continue # Skip corrupt checks if it's explicitly fake

        # 2. Detect Corrupt (Impossible physical dimensions or prices)
        is_corrupt = False
        floor = lst.get("floor")
        total_floors = lst.get("total_floors")
        carpet = lst.get("carpet_area")
        super_area = lst.get("super_built_up_area")
        price = lst.get("price")
        
        # Floor cannot be higher than total floors
        if floor is not None and total_floors is not None and floor > total_floors and total_floors > 0:
            is_corrupt = True
        # Carpet area cannot be larger than super built up area
        if carpet is not None and super_area is not None and carpet > super_area and super_area > 0:
            is_corrupt = True
        # Impossible zero or negative values
        if price is not None and price <= 0:
            is_corrupt = True
        if carpet is not None and carpet <= 0:
            is_corrupt = True
            
        if is_corrupt:
            corrupt_ids.append(lid)

    corrupt_ids.sort()
    fake_ids.sort()

    # Q2: unique_properties
    # Deduplication key based on physics: Coordinates, Apt Name, Floor, Bedrooms
    unique_set = set()
    for lst in listings:
        key = (
            lst.get("latitude"),
            lst.get("longitude"),
            lst.get("bedroom"),
            (lst.get("apartment_name") or "").lower().strip(),
            lst.get("floor")
        )
        unique_set.add(key)
    q2 = len(unique_set)

    # Q3: active_listings (look for is_live == True)
    q3 = sum(1 for x in listings if x.get("is_live") is True)

    # Q5: total_monthly_rent in assigned locality (Kukatpally)
    target_locality = "kukatpally"
    q5 = sum(r.get("price", 0) for r in rentals if (r.get("locality") or "").lower() == target_locality)

    # Q6: avg_price_per_sqft_2bhk
    # active (is_live=True), bedroom=2, exclude corrupt/fake.
    valid_ppsft = []
    exclude_set = set(corrupt_ids + fake_ids)
    for lst in listings:
        if lst.get("is_live") is True and lst.get("bedroom") == 2:
            lid = lst.get("listing_id")
            if lid not in exclude_set:
                price = lst.get("price")
                carpet = lst.get("carpet_area")
                if price and carpet and carpet > 0:
                    valid_ppsft.append(price / carpet)
    
    q6 = round(sum(valid_ppsft) / len(valid_ppsft), 2) if valid_ppsft else 0.0

    # Q7: costliest_project
    # Find the project with the highest price_max
    costliest = max(projects, key=lambda x: x.get("price_max", 0))
    q7 = {
        "project_id": costliest.get("project_id"),
        "price_max_inr": costliest.get("price_max", 0)
    }

    # Q8: listings_last_7_days
    # REFERENCE: 2026-09-10T00:00:00+05:30 -> UTC is 2026-09-09T18:30:00Z
    ref_utc = datetime(2026, 9, 9, 18, 30, 0, tzinfo=timezone.utc)
    start_utc = ref_utc - timedelta(days=7)
    
    q8 = 0
    for lst in listings:
        posted = lst.get("posted_at")
        if posted:
            try:
                # The API provides '2026-06-14T09:20:00Z', replacing Z for python parsing
                dt = datetime.fromisoformat(posted.replace("Z", "+00:00"))
                if start_utc <= dt < ref_utc:
                    q8 += 1
            except Exception:
                pass

    # Q10: projects_with_wrong_listing_count
    # Compare project.total_listings against actual occurrences in listings.json
    project_counts = {}
    for lst in listings:
        pid = lst.get("project_id")
        if pid:
            project_counts[pid] = project_counts.get(pid, 0) + 1
            
    q10 = 0
    for proj in projects:
        pid = proj.get("project_id")
        reported = proj.get("total_listings", 0)
        actual = project_counts.get(pid, 0)
        if reported != actual:
            q10 += 1

    # Formulate the final answers object
    answers = {
        "total_listing_records": q1,
        "unique_properties": q2,
        "active_listings": q3,
        "corrupt_listing_ids": corrupt_ids,
        "total_monthly_rent": q5,
        "avg_price_per_sqft_2bhk": q6,
        "costliest_project": q7,
        "listings_last_7_days": q8,
        "fake_listing_ids": fake_ids,
        "projects_with_wrong_listing_count": q10
    }

    print("\n" + "="*50)
    print("[RESULTS] FOR SUBMISSION.JSON")
    print("="*50)
    # Don't print massive arrays to terminal, summarize them
    summary = answers.copy()
    summary["corrupt_listing_ids"] = f"[{len(corrupt_ids)} IDs]"
    summary["fake_listing_ids"] = f"[{len(fake_ids)} IDs]"
    print(json.dumps(summary, indent=2))
    print("="*50)
    
    # Save the full submission.json skeleton
    submission_path = os.path.join(os.path.dirname(__file__), "..", "submission.json")
    
    submission_data = {
      "api_key": "IVY26-5C142A217217",
      "candidate": {
        "name": "Abhijeet Kumar",
        "email": "",
        "repo_url": "https://github.com/abhikr1871/find_homes",
        "demo_url": ""
      },
      "answers": answers,
      "findings": []
    }
    
    with open(submission_path, "w", encoding="utf-8") as f:
        json.dump(submission_data, f, indent=2)
        
    print(f"\n[OK] Answers completely saved to {submission_path}")

if __name__ == "__main__":
    run_analysis()
