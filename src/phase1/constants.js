const COST_BUCKETS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const FIELD_ALIASES = {
  restaurant_id: ['restaurant_id', 'res_id', 'id', 'restaurantId'],
  name: ['name', 'restaurant_name', 'Restaurant Name', 'res_name'],
  location_city: ['location_city', 'city', 'listed_in(city)', 'location', 'City'],
  cuisines: ['cuisines', 'cuisine', 'Cuisine'],
  cost_for_two: [
    'cost_for_two',
    'average_cost_for_two',
    'approx_cost_for_two',
    'approx_cost(for two people)',
    'cost',
  ],
  rating: ['rating', 'aggregate_rating', 'user_rating', 'Rate', 'rate'],
  additional_tags: ['additional_tags', 'highlights', 'features', 'tags'],
};

module.exports = {
  COST_BUCKETS,
  FIELD_ALIASES,
};

