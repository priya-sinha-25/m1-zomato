from pydantic import BaseModel, Field
from typing import List, Optional

class UserPreferences(BaseModel):
    location: Optional[str] = None
    budget_bucket: Optional[str] = None
    cuisine: Optional[str] = None
    cravings: Optional[str] = None
    min_rating: Optional[float] = None
    additional_preferences: List[str] = Field(default_factory=list)
    top_k: int = 5

def preferences_from_mapping(data: dict) -> UserPreferences:
    location = data.get("location")
    if location: location = str(location).strip().lower()
        
    budget = data.get("budget_bucket")
    if budget: budget = str(budget).strip().lower()
        
    cuisine = data.get("cuisine")
    if cuisine: cuisine = str(cuisine).strip().lower()

    cravings = data.get("cravings")
    if cravings: cravings = str(cravings).strip().lower()

    min_rating = data.get("min_rating")
    if min_rating is not None:
        try: min_rating = float(min_rating)
        except ValueError: min_rating = None
            
    additional = data.get("additional_preferences")
    extra_tags = []
    if additional:
        if isinstance(additional, list):
            extra_tags = [str(t).strip().lower() for t in additional]
        elif isinstance(additional, str):
            extra_tags = [t.strip().lower() for t in additional.split(",")]
            
    top_k = data.get("top_k", 5)

    return UserPreferences(
        location=location,
        budget_bucket=budget,
        cuisine=cuisine,
        cravings=cravings,
        min_rating=min_rating,
        additional_preferences=extra_tags,
        top_k=top_k
    )
