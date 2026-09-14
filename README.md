# Ivy Homes Assignment: Property Intelligence

This repository contains the full submission for the Ivy Homes internship assignment, designed and implemented defensively against an unreliable backend API.

## Project Structure
- **`/scripts`**: Contains pure Python data-extraction tools (`fetch_all_data.py`) and analysis scripts (`answer_questions.py`, `write_findings.py`) used to build local snapshots and calculate the exact answers.
- **`/data/raw`**: The raw snapshot of JSON objects pulled defensively from the live API.
- **`/src`**: The React + TypeScript + Tailwind frontend.
- **`submission.json`**: The final output containing 10 graded answers and 5 discovered API discrepancies.

## Execution Methodology
Because the API documentation was deliberately flawed, we built this project in strict phases:
1. **Extraction (Phase 1 & 2):** We quickly identified auth and pagination "lies". We scraped 4,400 listings using `offset` pagination instead of `page` and injected `X-API-Key` and `Bearer` tokens defensively.
2. **Analysis (Phase 3 & 4):** We built python scripts to locally parse the exact answers and mathematically isolate impossibilities (e.g., negative prices, corrupted total floors) and API lies (e.g., `price_max` returned in Crores instead of Rupees).
3. **Frontend (Phase 5 & 6):** We built a defensive React UI. It uses a custom Fetch client that natively handles the tricky Auth tokens, entirely ignores the API's sorting/filtering logic (handling it strictly on the client-side), and correctly scales project Crores back into human-readable Rupees.

## Declaration & AI Tools Used
- **Declaration:** This is my own work, and I have not shared my API key or my answers with anyone.
- **AI Tools Used:** Google Gemini (via Advanced Agentic Coding environment) was utilized heavily for strategic planning, python scripting, React scaffolding, and defensive code generation.

## How to Run
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173` and log in with the demo credentials.
