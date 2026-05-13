from typing import List
from ..phase1_ingestion.schema import Restaurant
from ..phase2_preferences.models import UserPreferences

def filter_and_rank(restaurants: List[Restaurant], prefs: UserPreferences) -> List[Restaurant]:
    def apply_filters(location, budget, rating, cuisine, cravings, additional):
        filtered = []
        for r in restaurants:
            if location and location not in r.location.lower():
                continue
            if budget and budget != r.cost_bucket:
                continue
            if rating and r.rating < rating:
                continue
            
            if cuisine:
                match = False
                for c in r.cuisines:
                    if cuisine in c.lower():
                        match = True
                        break
                if not match:
                    continue
                    
            if cravings:
                searchable = (r.name + " " + " ".join(r.cuisines) + " " + " ".join(r.extra_tags)).lower()
                cravings_match = False
                for craving_word in cravings.split():
                    if craving_word in searchable:
                        cravings_match = True
                        break
                if not cravings_match:
                    continue
                    
            if additional:
                searchable = (r.name + " " + " ".join(r.cuisines) + " " + " ".join(r.extra_tags)).lower()
                all_match = True
                for tag in additional:
                    if tag not in searchable:
                        all_match = False
                        break
                if not all_match:
                    continue
                    
            filtered.append(r)
        return filtered

    # 1. Try strict filtering
    filtered = apply_filters(prefs.location, prefs.budget_bucket, prefs.min_rating, prefs.cuisine, prefs.cravings, prefs.additional_preferences)
    
    # 2. Relax budget
    if not filtered:
        filtered = apply_filters(prefs.location, None, prefs.min_rating, prefs.cuisine, prefs.cravings, prefs.additional_preferences)
        
    # 3. Relax additional/cravings/cuisine
    if not filtered:
        filtered = apply_filters(prefs.location, None, prefs.min_rating, None, None, None)
        
    # 4. Relax rating
    if not filtered:
        filtered = apply_filters(prefs.location, None, None, None, None, None)

    filtered.sort(key=lambda x: x.rating, reverse=True)
    return filtered[:prefs.top_k]
