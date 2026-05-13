function buildCandidatePayload(candidates) {
  return candidates.map((item, index) => ({
    rank_hint: index + 1,
    restaurant_id: item.restaurant_id,
    restaurant_name: item.name,
    location_city: item.location_city,
    cuisine: item.cuisines.join(', '),
    rating: item.rating,
    estimated_cost_for_two: item.cost_for_two,
    cost_bucket: item.cost_bucket,
    matching_tags: item.additional_tags || [],
  }));
}

module.exports = {
  buildCandidatePayload,
};

