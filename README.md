# Ivy Homes — Find Homes Frontend

**Live Demo:** _[Add Vercel URL after deployment]_  
**Repository:** https://github.com/abhikr1871/find_homes

---

## How to Run

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173`. Log in with:
- Email: `demo1@ivy.homes`, `demo2@ivy.homes`, or `demo3@ivy.homes`
- Password: `b2ad1202e9`

---

## How I Worked Out Which Parts of the Documentation to Distrust

My approach was to treat every single piece of documentation as a hypothesis to be tested, not a fact to be trusted. I started with the highest-risk areas first.

**Step 1 — Auth first, always.**  
The first thing I tested was authentication, because if auth is wrong, everything else fails silently. I sent the API key as a query parameter as documented and immediately got a 401. The error was explicit: "use X-API-Key header". That was Lie #1 found in under 60 seconds.

**Step 2 — Pull the entire dataset before reading a single record.**  
Following the assignment's own advice, I wrote `scripts/fetch_all_data.py` to dump all 4,400 listings, 1,650 rentals, and 470 projects locally. During this, I found Lie #2: the Bearer token is required even for "public" listing data. And Lie #3: the pagination uses `offset`, not `page`, and is hard-capped at 50 records regardless of the `limit` parameter.

**Step 3 — Verify numbers that smell wrong.**  
Once I had all 470 projects locally, I noticed `price_max` values like `99.8` and `45.2`. No real estate property has a maximum price of ₹99.8. Immediately I multiplied by 10,000,000 and got sensible Crore-range values. That was Lie #4 (units).

**Step 4 — Test every filter parameter.**  
I sent `GET /v1/listings?bedroom=2` and printed the unique bedroom values returned. Got `{1, 2, 3, 4, 5}`. The filter was silently ignored. Repeated for `furnishing=Furnished` — same result. This means **all filter logic must live in the browser**.

**Step 5 — Cross-reference counts.**  
I counted how many listings each project actually appeared in (by `project_id`) and compared against each project's `total_listings` field. 363 out of 470 projects (77%) had wrong counts. This is a `consistency` finding.

**Step 6 — Fake listings via contact number analysis.**  
The problem statement said *"a seller can write anything"* and specifically mentioned fake listings. My hypothesis: a genuine property seller lists 1-2 properties. If a contact phone number appears 10+ times across completely different properties (different areas, sizes, floors), that number belongs to a fake lead-generation agent, not a genuine seller. I found 818 such listings.

---

## What I Checked That Turned Out Fine

These are the hypotheses that did **not** pan out — important for showing methodology:

**1. Token expiry — fine.**  
I was worried the Bearer token might expire quickly and break the 30-minute session requirement. I tested it — it lasts well beyond 30 minutes.

**2. Pagination off-by-one — fine.**  
I suspected `offset=4350` might return fewer than 50 records and mis-report `has_more`. It did not. The final page correctly reported `has_more: false`.

**3. IST timezone in timestamps — fine.**  
I suspected `posted_at` might be UTC without timezone info. All timestamps returned use explicit `+05:30` offsets, so date comparison for Q8 (listings in last 7 days) worked without conversion.

**4. `is_live` field reliability — fine.**  
I suspected `is_live` might be stale data. Spot-checking a sample of `is_live: false` listings showed consistent patterns (older `posted_at` dates), so this field appears reliable.

**5. `/auth/login` email case sensitivity — fine.**  
I tested `Demo1@ivy.homes` vs `demo1@ivy.homes`. The API handles both correctly.

**6. Locality filter — partially fine.**  
Unlike `bedroom` and `furnishing`, the `locality` filter *does* appear to work server-side. Only `locality` returns correctly filtered results.

---

## What I Would Do With Another Two Days

1. **Better fake listing detection.** My threshold of ≥10 listings per phone is conservative. I would build a scoring system combining phone reuse + coordinates overlap + description similarity + price-to-area anomaly detection to catch more subtle fraud.

2. **Rental detail pages.** I built a rental list but not individual rental detail pages — the same pattern as the listing detail page.

3. **Map view.** All listings have `latitude` and `longitude`. A Leaflet.js map with clustered pins would make it dramatically more usable.

4. **Price trend analysis.** With 4,400 listings plus timestamps, I could calculate rough price-per-sqft trends over time per locality.

5. **Full test suite.** I would write Jest tests for the defensive filter logic, the corruption detection, and the Crore-to-Rupee conversion to prevent regressions.

---

## AI Tools Used

Google Gemini (via Advanced Agentic Coding / Antigravity) was used extensively for:
- Strategic planning of the phased approach
- Writing Python extraction and analysis scripts
- Scaffolding the React + TypeScript + Tailwind frontend
- Debugging TypeScript strict mode errors
- Generating defensive filter and pagination logic

All code was reviewed, understood, and verified by me before submission. The hypotheses, the specific bugs found, and the conclusions drawn are my own.

---

## Architecture Notes

- **`scripts/`** — Python data extraction and analysis (runs independently of the frontend)
- **`data/raw/`** — Local snapshot of all API data
- **`src/api/client.ts`** — Single fetch wrapper that injects both auth headers
- **`src/pages/`** — One file per page; each page does its own client-side filtering
- **`submission.json`** — Final answers and findings
