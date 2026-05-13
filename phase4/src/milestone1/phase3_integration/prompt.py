import json
from typing import List, Tuple
from ..phase1_ingestion.schema import Restaurant
from ..phase2_preferences.models import UserPreferences

def build_prompt_payload(candidates: List[Restaurant], prefs: UserPreferences) -> Tuple[str, str]:
    candidates_json = [r.model_dump() for r in candidates]
    
    system_prompt = """You are an AI restaurant recommendation engine.
You will be provided with user preferences and a list of candidate restaurants.
Your task is to rank the candidates and provide an explanation for why each is a good fit.
You MUST ONLY recommend restaurants from the provided CANDIDATES list. Do not hallucinate.
Return your response as a JSON object with this exact schema:
{
  "recommendations": [
    {
      "restaurant_id": "string",
      "restaurant_name": "string",
      "cuisine": "string",
      "rating": 0.0,
      "estimated_cost_for_two": 0,
      "explanation": "string"
    }
  ]
}
"""

    user_prompt = f"""
PREFERENCES:
{prefs.model_dump_json()}

CANDIDATES:
{json.dumps(candidates_json, indent=2)}
"""

    return system_prompt, user_prompt
