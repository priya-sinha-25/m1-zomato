import sys
sys.path.append('src')
from milestone1.phase1_ingestion.loader import load_restaurants
from milestone1.phase2_preferences.models import preferences_from_mapping
from milestone1.phase3_integration.filter import filter_and_rank

restaurants = load_restaurants()
prefs_data = {'location': 'bellandur', 'budget_bucket': 'high', 'cuisine': 'North Indian', 'cravings': 'spicy food', 'min_rating': 4.0}
prefs = preferences_from_mapping(prefs_data)

print('Preferences:', prefs)
print('Available restaurants:')
for r in restaurants:
    if 'bellandur' in r.location.lower():
        print(f'  {r.name} - Cuisines: {r.cuisines}, Rating: {r.rating}')

print('\nTesting filtering...')
filtered = filter_and_rank(restaurants, prefs)
print(f'Filtered {len(filtered)} restaurants:')
for r in filtered:
    print(f'  {r.name}')
