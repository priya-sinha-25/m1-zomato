const PHASE2_DEFAULTS = {
  pre_llm_top_k: 25,
  fallback_min_candidates: 5,
  max_additional_preferences: 5,
};

const LOCATION_ALIASES = {
  bengaluru: 'bangalore',
  newdelhi: 'delhi',
};

const CUISINE_ALIASES = {
  northindian: 'north indian',
  southindian: 'south indian',
  streetfood: 'street food',
};

module.exports = {
  PHASE2_DEFAULTS,
  LOCATION_ALIASES,
  CUISINE_ALIASES,
};

