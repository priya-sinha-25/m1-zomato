import os
import json
import logging
from typing import List, Dict, Any

def recommend_with_groq(system_prompt: str, user_prompt: str, candidates: List[Any]) -> Dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY")
    
    if not api_key:
        logging.warning("GROQ_API_KEY not found. Using deterministic fallback.")
        return _deterministic_fallback(candidates)
        
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama3-8b-8192",
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        content = chat_completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logging.error(f"LLM call failed: {e}")
        return _deterministic_fallback(candidates)

def _deterministic_fallback(candidates: List[Any]) -> Dict[str, Any]:
    recs = []
    for c in candidates:
        recs.append({
            "restaurant_id": c.restaurant_id,
            "restaurant_name": c.name,
            "cuisine": ", ".join(c.cuisines),
            "rating": c.rating,
            "estimated_cost_for_two": c.cost_for_two,
            "explanation": "Deterministic fallback match based on your preferences."
        })
    return {"recommendations": recs[:5]}
