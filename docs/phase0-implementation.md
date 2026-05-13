## Phase 0 Implementation

This document captures the implementation completed for **Phase 0: Project setup & contracts** as defined in `docs/phase-wise-architecture.md`.

---

## Scope Covered

Phase 0 required:
- Data contracts (restaurant fields + recommendation response schema)
- Runtime boundaries (dataset script outputs vs API inputs/outputs)
- `top-N` output contract and centralized defaults
- Prompt versioning strategy
- Basic deterministic test harness

All of the above have been implemented.

---

## Files Implemented

### 1) `src/phase0/contracts.json`
Defines a strict JSON Schema (`draft 2020-12`) for:
- `restaurantRecord`
  - Required fields: `restaurant_id`, `name`, `location_city`, `cuisines`, `cost_for_two`, `cost_bucket`, `rating`
- `recommendationResponse`
  - Required top-level fields: `request_id`, `prompt_version`, `top_n`, `recommendations`
  - Required recommendation item fields:
    - `restaurant_id`
    - `restaurant_name`
    - `cuisine`
    - `rating`
    - `estimated_cost_for_two`
    - `explanation`

Also includes runtime boundaries:
- Dataset script outputs
- API service inputs
- API service outputs

---

### 2) `src/phase0/config.json`
Centralized defaults and validation guardrails:
- Defaults:
  - `top_n = 5`
  - `max_top_n = 20`
  - `pre_llm_top_k = 25`
  - `min_rating_default = 3.5`
  - `prompt_version = v1.0.0`
- Allowed budget buckets: `low`, `medium`, `high`
- Numeric validation ranges for rating and `top_n`

This file acts as the single source of truth for recommendation-size constraints in Phase 0.

---

### 3) `src/phase0/prompt-versioning.json`
Implements a prompt version registry with:
- `active_version` (`v1.0.0`)
- Version metadata (`status`, timestamp, purpose)
- Required output fields expected from the prompt
- Grounding notes to reduce hallucinations

This establishes a controlled path for future prompt updates and regression tracking.

---

### 4) `phase0.check.js`
Basic deterministic validation harness that checks:
- Config integrity and ranges
- Presence of required contract sections/keys
- Schema-based validation of sample `restaurantRecord` and `recommendationResponse` payloads
- Prompt-version consistency between:
  - `src/phase0/config.json` (`defaults.prompt_version`)
  - `src/phase0/prompt-versioning.json` (`active_version`)

On success, it prints:
- `Phase 0 checks passed.`

---

## How to Run

From the project root:

```bash
node phase0.check.js
```

Expected output:

```text
Phase 0 checks passed.
```

---

## Outcome

Phase 0 is now implemented with clear contracts, centralized defaults, prompt versioning scaffolding, and a deterministic baseline check harness. This provides a stable foundation for Phase 1 (dataset ingestion and preprocessing).

