# Phase-wise architecture: restaurant recommendation system

This document breaks the build into phases that map to the workflow in problemstatement.md: data ingestion → user input → integration (filter + prompt prep) → LLM recommendation → output display.

## Phase 0 — Scope and foundations
**Item** | **Outcome**
--- | ---
Product slice | Basic web UI — source of user input and primary presentation of results for milestone 1 (see phase0-scope.md); CLI remains for dev/diagnostics.
Stack | Language/runtime, dependency manager, where secrets live (e.g. .env for API keys, never committed).
Dataset contract | Confirm Hugging Face dataset fields you will support in v1; document column → internal field mapping.
Non-goals | Explicitly defer (e.g. user accounts, live Zomato API, maps) to avoid scope creep.

Exit criteria: written assumptions (stack, v1 UI, supported preference fields) and a local way to run the app end-to-end once later phases exist.
Implemented artifacts: package src/milestone1/phase0/ (paths, scope, info/doctor commands), phase0-scope.md, dataset-contract.md, repo README.md, .env.example. CLI: milestone1 info / milestone1 doctor.

---

## Phase 1 — Data ingestion and canonical model
**Layer** | **Responsibility**
--- | ---
Acquisition | Download or stream ManikaSaini/zomato-restaurant-recommendation; cache locally if useful for iteration.
Normalization | Clean types (ratings as numbers, cost as enum or numeric band), handle missing values, dedupe rows if needed.
Canonical schema | Internal Restaurant (or equivalent) with: name, location, cuisines, cost, rating, plus any extra columns you keep for prompts.

Exit criteria: a single module (or package) that loads data and returns a typed in-memory collection or queryable table; unit tests on parsing for a few sample rows.
Implemented: package src/milestone1/phase1_ingestion/ (Restaurant, load_restaurants / iter_restaurants, normalization, Hub revision pin, schema assertion). CLI: milestone1 ingest-smoke --limit N. Hub integration tests: RUN_HF_INTEGRATION=1 pytest -m integration.

---

## Phase 2 — User preferences and validation
**Component** | **Responsibility**
--- | ---
Preference model | Structured fields: location, budget band, cuisine(s), minimum rating; optional free-text for “additional preferences.”
Validation | Reject or coerce invalid input (unknown location, rating out of range); clear error messages for the UI/CLI.

Exit criteria: preferences deserialize from form/API/CLI args into one object used by the filter layer; validation errors are user-visible.
Implemented: package src/milestone1/phase2_preferences/ (UserPreferences, preferences_from_mapping, optional allowed_city_names corpus check, allowed_cities_from_restaurants). CLI: milestone1 prefs-parse ... (prints JSON or field errors on stderr).

---

## Phase 3 — Integration layer (retrieval + prompt assembly)
**Component** | **Responsibility**
--- | ---
Deterministic filter | Apply hard filters first: location, min rating, budget, cuisine overlap—reduce to top N candidates (cap for LLM context, e.g. 15–50).
Ranking hint (optional) | Pre-sort by rating or composite score so the LLM sees a sensible default order even before reasoning.
Prompt builder | System + user messages (or single structured prompt) including: user preferences as JSON or bullets; candidate table as markdown/JSON; instructions to only recommend from the list; output format (see Phase 4).

Exit criteria: given preferences + loaded dataset, produce a stable (candidates[], prompt_payload) without calling the LLM yet; tests for filter edge cases (no matches, too many matches).
Implemented: package src/milestone1/phase3_integration/ (filter_and_rank, build_prompt_payload, build_integration_output). CLI: milestone1 prompt-build.

---

## Phase 4 — Recommendation engine (LLM)
**Concern** | **Approach**
--- | ---
Model I/O | Thin client: temperature, max tokens, timeout; inject API key from environment.
Grounding | Prompt requires the model to cite restaurant names from the candidate list only; refuse or return empty if nothing fits.
Structured output | Ask for JSON (e.g. rankings[] with restaurant_id, rank, explanation) or strict markdown sections—then parse and validate.
Resilience | Retry on transient errors; fallback: return deterministic top-k with template explanations if the LLM fails.

Exit criteria: end-to-end call returns ranked items with explanations; parser validates structure; failures degrade gracefully.
Implemented: package src/milestone1/phase4_llm/ (Groq OpenAI-compatible client, JSON rankings parse, deterministic fallback, recommend_with_groq). CLI: milestone1 recommend. Secrets: GROQ_API_KEY (see .env.example).

---

## Phase 5 — Output and experience
**Surface** | **Responsibility**
--- | ---
Rendering | For each recommendation: name, cuisine, rating, estimated cost, AI explanation (per problem statement).
Empty states | “No restaurants match filters” vs “LLM could not justify picks”—different copy.
Observability (light) | Log latency, token usage if available, and filter counts (no PII in logs unless required).

Exit criteria: demo path from user input to readable results in one run; copy and layout match the minimum fields in the problem statement.
Implemented: package src/milestone1/phase5_output/ (markdown/plain rendering, empty-state copy, stderr telemetry JSON). CLI: milestone1 recommend-run (end-to-end readable output + telemetry).

---

## Phase 6 — Backend (HTTP API)
**Concern** | **Approach**
--- | ---
Role | Thin HTTP service that owns server-side secrets (GROQ_API_KEY), dataset access, and orchestration. The browser must not call Groq or Hugging Face directly.
Contract | Stable JSON request/response for “recommend”: preferences body aligned with Phase 2 keys; response carries ranked items (ids + display fields + explanations), source (llm / fallback / no_candidates), filter/candidate counts, and optional non-sensitive telemetry fields for the UI.
Endpoints (v1 intent) | POST /api/v1/recommendations (or equivalent) — validate input, run load_restaurants (with limits/caching policy), recommend_with_groq, return DTOs. GET /health — process up, keys configured (without exposing values). Optional: GET /api/v1/meta — e.g. sample allowed_cities cap for form hints.
Cross-cutting | Timeouts aligned with Phase 4; structured server logs (counts, latency, token totals—no raw user notes in info-level logs unless you explicitly choose to); CORS restricted to the dev frontend origin; request size limits on free-text fields (reuse Phase 2 max length).
Stack | Python-first is natural: e.g. FastAPI or Flask in src/ or a sibling package, sharing the installed milestone1 library. Alternative stacks (Node, etc.) are possible only if they duplicate contracts and call a Python sidecar—avoid unless required.

Exit criteria: frontend can complete one recommendation flow using only the API; API returns the same logical outcomes as milestone1 recommend / recommend-run for the same inputs (modulo caching).
Implemented: pending — document target layout here when added (e.g. src/milestone1/api/ or apps/api/).

---

## Phase 7 — Frontend (web UI)
**Concern** | **Approach**
--- | ---
Role | Primary user-facing surface: preference form + results list, per phase0-scope.md.
Data flow | Browser only talks to the Phase 6 API. Map form fields to the API JSON schema (location, budget band, cuisines, minimum rating, optional additional text).
UI | Results show name, cuisines, rating, estimated cost, AI explanation for each row; reuse Phase 5 empty-state semantics (“no filter match” vs “model returned no grounded picks”) with clear, distinct copy.
UX | Loading states, validation errors inline, disabled submit while pending; optional “copy as Markdown” for demo.
Stack | Choose one and stay consistent: e.g. React + Vite (SPA) or HTMX + server templates (minimal JS). Host locally for milestone 1; no production SLA required in Phase 0.

Exit criteria: one demo path in the README: start API + UI, submit preferences, see ranked results or an intentional empty state.
Implemented: pending — e.g. apps/web/ or frontend/ + README section “Run the web app”.

---

## Phase 8 — Deployment using Streamlit (optional)
**Concern** | **Approach**
--- | ---
Role | A single-process Python app (Streamlit) that exposes the same recommendation flow as the CLI/API: preferences in widgets → load corpus (Phase 1) → validate (Phase 2) → filter + prompt (Phase 3) → recommend_with_groq (Phase 4) → render ranked cards with explanations (Phase 5 semantics). No Node build and no separate SPA host required for this path.
Secrets | GROQ_API_KEY (and optional GROQ_MODEL) via Streamlit secrets (st.secrets) on Streamlit Community Cloud or via environment variables when self-hosting—same rules as Phase 6: keys never ship to the browser client bundle; Streamlit runs logic server-side.
Deployment (free tier) | Streamlit Community Cloud: connect the GitHub repo, set the main file path (e.g. streamlit_app.py or src/milestone1/phase8_streamlit/app.py), add secrets in the dashboard, deploy. Cold starts and resource limits apply on the free tier; keep load_limit / candidate_cap conservative. Alternatives: Docker image (streamlit run …) on Render/Fly/other free allowances.
Relationship to Phase 6–7 | Complementary: Phase 7 remains the primary product UI (browser + REST). Phase 8 is ideal for course demos, stakeholder previews, and fast sharing without operating Vite + CORS + two deployables. You may implement Streamlit without calling the HTTP API by importing milestone1 directly (duplication of orchestration is acceptable if thin); alternatively call POST /api/v1/recommendations if you want one orchestration path.
UX scope | Forms with st.selectbox / st.text_input / st.slider for location, cuisines, budget, minimum rating, and additional text; st.spinner while the model runs; st.expander for raw JSON or telemetry if useful. Match empty-state copy from Phase 5 where practical.

Exit criteria: README (or a short docs/streamlit-deploy.md) documents how to run locally (streamlit run …) and how to deploy to Community Cloud (repo layout, secrets names, branch); a reviewer can open the hosted URL and complete one successful recommendation or see an intentional empty state.
Implemented: package src/milestone1/phase8_streamlit/ (app.py), repo root streamlit_app.py (Cloud entrypoint), optional dependency [streamlit] in pyproject.toml, and streamlit-deploy.md.

---

## Phase 9 — Hardening and handoff (optional but recommended)
Automated tests for filters, prompt shape, JSON parsing (fixtures with fake LLM responses), and API contract tests (golden JSON for happy/empty/error paths).
README: install, set GROQ_API_KEY, run API + UI, CLI fallbacks, and limitations (dataset revision, rate limits, candidate cap).
Cost/latency notes: candidate cap, model id, when to raise load limits, caching strategy for repeated queries (optional in-process LRU of recent Hub windows—only if measured need).

---

## Phase 10 — Production Deployment using Streamlit Community Cloud
**Concern** | **Approach**
--- | ---
Role | Final cloud deployment of the application to a public, shareable URL using Streamlit's free hosting tier.
Preparation | Ensure the repository is pushed to GitHub with `streamlit_app.py` at the root, and that `pyproject.toml` contains `streamlit` as a dependency.
Configuration | Connect the GitHub repository to Streamlit Community Cloud via share.streamlit.io. Point the main file path to `streamlit_app.py`.
Secrets Management | Never commit `.env` files. Set `GROQ_API_KEY` directly within the Streamlit Cloud dashboard under "Advanced settings" -> "Secrets".
Exit criteria | A publicly accessible URL where users can interact with the Zomato AI system without installing anything locally.
