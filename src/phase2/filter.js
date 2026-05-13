const { PHASE2_DEFAULTS } = require('./config');

function normalizedEquals(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function hasCuisineMatch(record, preferredCuisine) {
  if (!preferredCuisine) return true;
  return (record.cuisines || []).some((cuisine) => normalizedEquals(cuisine, preferredCuisine));
}

function hasAdditionalPreferenceMatch(record, preferences) {
  if (!preferences || preferences.length === 0) return true;
  const searchable = String(record.searchable_text || '').toLowerCase();
  return preferences.every((token) => searchable.includes(token));
}

function scoreRecord(record, prefs) {
  let score = 0;
  score += record.rating * 10;

  if (prefs.location && normalizedEquals(record.location_city, prefs.location)) score += 15;
  if (prefs.cuisine && hasCuisineMatch(record, prefs.cuisine)) score += 12;
  if (prefs.budget_bucket && normalizedEquals(record.cost_bucket, prefs.budget_bucket)) score += 8;

  if (prefs.additional_preferences && prefs.additional_preferences.length > 0) {
    const searchable = String(record.searchable_text || '').toLowerCase();
    for (const token of prefs.additional_preferences) {
      if (searchable.includes(token)) score += 2;
    }
  }

  score += Math.max(0, 5 - Math.abs((prefs.min_rating || 0) - record.rating));
  return Number(score.toFixed(3));
}

function deterministicSort(a, b) {
  if (b._score !== a._score) return b._score - a._score;
  if (b.rating !== a.rating) return b.rating - a.rating;
  if (a.cost_for_two !== b.cost_for_two) return a.cost_for_two - b.cost_for_two;
  return String(a.name).localeCompare(String(b.name));
}

function strictFilter(records, prefs) {
  return records.filter((record) => {
    if (prefs.location && !normalizedEquals(record.location_city, prefs.location)) return false;
    if (prefs.budget_bucket && !normalizedEquals(record.cost_bucket, prefs.budget_bucket)) return false;
    if (prefs.cuisine && !hasCuisineMatch(record, prefs.cuisine)) return false;
    if (prefs.min_rating !== undefined && record.rating < prefs.min_rating) return false;
    if (!hasAdditionalPreferenceMatch(record, prefs.additional_preferences)) return false;
    return true;
  });
}

function relaxedFilter(records, prefs) {
  const variants = [
    { ...prefs, additional_preferences: [] },
    { ...prefs, additional_preferences: [], min_rating: undefined },
    { ...prefs, additional_preferences: [], min_rating: undefined, budget_bucket: undefined },
    {
      ...prefs,
      additional_preferences: [],
      min_rating: undefined,
      budget_bucket: undefined,
      cuisine: undefined,
    },
  ];

  for (const variant of variants) {
    const candidates = strictFilter(records, variant);
    if (candidates.length >= PHASE2_DEFAULTS.fallback_min_candidates) {
      return { candidates, relaxation_applied: true, active_constraints: variant };
    }
  }

  return {
    candidates: strictFilter(records, variants[variants.length - 1]),
    relaxation_applied: true,
    active_constraints: variants[variants.length - 1],
  };
}

function selectCandidates(records, prefs) {
  let filtered = strictFilter(records, prefs);
  let relaxationApplied = false;
  let activeConstraints = prefs;

  if (filtered.length < PHASE2_DEFAULTS.fallback_min_candidates) {
    const fallback = relaxedFilter(records, prefs);
    filtered = fallback.candidates;
    relaxationApplied = fallback.relaxation_applied;
    activeConstraints = fallback.active_constraints;
  }

  const ranked = filtered
    .map((record) => ({
      ...record,
      _score: scoreRecord(record, activeConstraints),
    }))
    .sort(deterministicSort)
    .slice(0, prefs.top_k || PHASE2_DEFAULTS.pre_llm_top_k);

  return {
    candidates: ranked,
    meta: {
      strict_match_count: strictFilter(records, prefs).length,
      selected_count: ranked.length,
      relaxation_applied: relaxationApplied,
      active_constraints: activeConstraints,
    },
  };
}

module.exports = {
  selectCandidates,
};

