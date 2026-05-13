const { CUISINE_ALIASES, LOCATION_ALIASES, PHASE2_DEFAULTS } = require('./config');

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeLocation(location) {
  const token = normalizeToken(location).replace(/\s+/g, '');
  if (!token) return undefined;
  const alias = LOCATION_ALIASES[token];
  return alias || normalizeToken(location);
}

function normalizeCuisine(cuisine) {
  const token = normalizeToken(cuisine);
  if (!token) return undefined;
  const key = token.replace(/\s+/g, '');
  return CUISINE_ALIASES[key] || token;
}

function normalizeAdditionalPreferences(additionalPreferences) {
  if (!additionalPreferences) return [];
  const values = Array.isArray(additionalPreferences)
    ? additionalPreferences
    : String(additionalPreferences).split(',');
  return values
    .map((item) => normalizeToken(item))
    .filter(Boolean)
    .slice(0, PHASE2_DEFAULTS.max_additional_preferences);
}

function normalizePreferences(input) {
  const topK = Number(input.top_k || PHASE2_DEFAULTS.pre_llm_top_k);
  return {
    location: normalizeLocation(input.location),
    budget_bucket: normalizeToken(input.budget_bucket),
    cuisine: normalizeCuisine(input.cuisine),
    min_rating: input.min_rating === undefined ? undefined : Number(input.min_rating),
    additional_preferences: normalizeAdditionalPreferences(input.additional_preferences),
    top_k: Number.isNaN(topK) ? PHASE2_DEFAULTS.pre_llm_top_k : Math.max(1, topK),
  };
}

module.exports = {
  normalizePreferences,
};

