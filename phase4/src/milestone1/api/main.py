from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from ..phase1_ingestion.loader import load_restaurants
from ..phase2_preferences.models import UserPreferences, preferences_from_mapping
from ..phase3_integration.filter import filter_and_rank
from ..phase3_integration.prompt import build_prompt_payload
from ..phase4_llm.client import recommend_with_groq
from ..phase5_output.render import render_empty_state, format_recommendations

app = FastAPI(title="Zomato AI Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    location: Optional[str] = None
    budget_bucket: Optional[str] = None
    cuisine: Optional[str] = None
    cravings: Optional[str] = None
    min_rating: Optional[float] = None
    additional_preferences: Optional[str] = None
    top_k: Optional[int] = 5

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running"}

@app.post("/api/v1/recommendations")
def recommend(req: RecommendRequest):
    # 1. Ingestion
    candidates_db = load_restaurants()
    
    # 2. Preferences
    prefs_dict = req.model_dump(exclude_none=True)
    prefs = preferences_from_mapping(prefs_dict)
    
    # 3. Filter
    filtered_candidates = filter_and_rank(candidates_db, prefs)
    if not filtered_candidates:
        return render_empty_state("no_candidates")
        
    # 3b. Prompt Assembly
    sys_prompt, user_prompt = build_prompt_payload(filtered_candidates, prefs)
    
    # 4. LLM Call
    llm_response = recommend_with_groq(sys_prompt, user_prompt, filtered_candidates)
    
    # 5. Render
    telemetry = {"candidates_found": len(filtered_candidates)}
    return format_recommendations(llm_response, telemetry)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
