## Phase 2: Candidate Selection (Structured Filtering)

This folder implements Phase 2 from `docs/phase-wise-architecture.md`.

### Delivered modules
- Filter service/module: `src/phase2/filter.js`
- Candidate payload builder: `src/phase2/payload.js`
- Top-K configuration + preference normalization: `src/phase2/config.js`, `src/phase2/preferences.js`

### Inputs
- Normalized Phase 1 data:
  - Default: `phase1/output/normalized-restaurants.json`
- User preferences JSON:
  - Default: `phase2/config/sample-preferences.json`

### Behavior
- Filters by:
  - `location`
  - `budget_bucket`
  - `cuisine`
  - `min_rating`
  - `additional_preferences`
- Applies deterministic ranking and truncates to `top_k`.
- If too few strict matches are found, uses progressive relaxation.
- Produces compact LLM-ready payload with only required fields.

### Run
```bash
node phase2/run-phase2.js
```

### Outputs
- `phase2/output/selected-candidates.json`
- `phase2/output/llm-candidate-payload.json`
- `phase2/output/selection-metadata.json`

