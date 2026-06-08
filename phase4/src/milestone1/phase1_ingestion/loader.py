import json
import os
from typing import List
from .schema import Restaurant

def load_restaurants(json_path: str = None) -> List[Restaurant]:
    """
    Loads restaurants from a local JSON or fetches from Hugging Face if implemented.
    For this milestone, we read the existing normalized dataset we injected earlier.
    """
    if json_path is None:
        # Default to checking from the Streamlit working directory
        json_path = os.path.abspath("phase1/output/normalized-restaurants.json")
        if not os.path.exists(json_path):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "..", "phase1", "output", "normalized-restaurants.json"))
    
    if not os.path.exists(json_path):
        # Bulletproof Fallback: Return dummy data if file is completely missing
        return [
            Restaurant(
                restaurant_id="fallback_1",
                name="The AI Cafe (Fallback)",
                location="bellandur",
                cuisines=["Italian", "Cafe"],
                cost_for_two=800,
                cost_bucket="medium",
                rating=4.8,
                extra_tags=["outdoor seating", "romantic"]
            ),
            Restaurant(
                restaurant_id="fallback_2",
                name="Data Diner (Fallback)",
                location="bellandur",
                cuisines=["North Indian"],
                cost_for_two=1200,
                cost_bucket="high",
                rating=4.2,
                extra_tags=["spicy"]
            )
        ]

    with open(json_path, "r", encoding="utf-8-sig") as f:
        raw_data = json.load(f)
    
    results = []
    for row in raw_data:
        results.append(Restaurant(
            restaurant_id=str(row.get("restaurant_id", "")),
            name=row.get("name", "Unknown"),
            location=row.get("location_city", "Unknown").lower(),
            cuisines=row.get("cuisines", []),
            cost_for_two=row.get("cost_for_two"),
            cost_bucket=row.get("cost_bucket", "medium").lower(),
            rating=float(row.get("rating", 0.0)),
            extra_tags=row.get("additional_tags", [])
        ))
    return results
