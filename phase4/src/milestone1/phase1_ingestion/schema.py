from pydantic import BaseModel, Field
from typing import List, Optional

class Restaurant(BaseModel):
    restaurant_id: str
    name: str
    location: str
    cuisines: List[str]
    cost_for_two: Optional[int] = None
    cost_bucket: str
    rating: float
    extra_tags: List[str] = Field(default_factory=list)
