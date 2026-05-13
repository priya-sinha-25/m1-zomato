## Phase 1: Dataset ingestion and preprocessing

This folder contains the Phase 1 implementation from `docs/phase-wise-architecture.md`.
Core source code lives under `src/phase1`.

### What it does
- Loads raw restaurant data from:
  - Local JSON file (`--mode local`), or
  - Hugging Face datasets server rows API (`--mode hf`)
- Normalizes critical fields:
  - `restaurant_id`, `name`, `location_city`, `cuisines`, `cost_for_two`, `cost_bucket`, `rating`
- Adds optional helper field:
  - `searchable_text`
- Drops malformed rows missing critical data
- Writes output artifacts:
  - `output/normalized-restaurants.json`
  - `output/ingestion-metadata.json`

### Run (local sample)
```bash
node phase1/run-phase1.js
```

### Run (Hugging Face rows API)
```bash
node phase1/run-phase1.js --mode hf --dataset ManikaSaini/zomato-restaurant-recommendation --config default --split train --offset 0 --length 200
```

