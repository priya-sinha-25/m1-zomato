# first-project

## Phase 0 artifacts

- `src/phase0/contracts.json`: strict JSON Schema contracts for restaurant records and recommendation responses.
- `src/phase0/config.json`: centralized defaults including `top_n` and prompt version.
- `src/phase0/prompt-versioning.json`: prompt version registry with active version.
- `src/phase0/check.js`: deterministic baseline contract check harness with schema validation.

## Source and tests layout

- `src/phase0`, `src/phase1`, `src/phase2`: phase-wise source code
- `tests/phase0`, `tests/phase1`, `tests/phase2`: phase-wise tests

### Run checks

```bash
node phase0.check.js
```

