const { COST_BUCKETS, FIELD_ALIASES } = require('./constants');

function firstDefinedValue(record, aliases) {
  for (const key of aliases) {
    if (record[key] !== undefined && record[key] !== null && String(record[key]).trim() !== '') {
      return record[key];
    }
  }
  return undefined;
}

function toNumber(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  if (!cleaned) {
    return undefined;
  }
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeCity(value) {
  if (!value) {
    return undefined;
  }
  const city = String(value).trim().toLowerCase();
  if (city === 'bengaluru') return 'Bangalore';
  if (city === 'new delhi') return 'Delhi';
  return city
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCuisines(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function computeCostBucket(costForTwo) {
  if (costForTwo === undefined) {
    return undefined;
  }
  if (costForTwo < 500) return COST_BUCKETS.LOW;
  if (costForTwo <= 1500) return COST_BUCKETS.MEDIUM;
  return COST_BUCKETS.HIGH;
}

function normalizeTags(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRestaurant(raw, index) {
  const id = firstDefinedValue(raw, FIELD_ALIASES.restaurant_id) || `generated_${index + 1}`;
  const name = firstDefinedValue(raw, FIELD_ALIASES.name);
  const city = normalizeCity(firstDefinedValue(raw, FIELD_ALIASES.location_city));
  const cuisines = normalizeCuisines(firstDefinedValue(raw, FIELD_ALIASES.cuisines));
  const costForTwo = toNumber(firstDefinedValue(raw, FIELD_ALIASES.cost_for_two));
  const rating = toNumber(firstDefinedValue(raw, FIELD_ALIASES.rating));
  const additionalTags = normalizeTags(firstDefinedValue(raw, FIELD_ALIASES.additional_tags));
  const costBucket = computeCostBucket(costForTwo);

  if (!name || !city || cuisines.length === 0 || costForTwo === undefined || rating === undefined) {
    return null;
  }

  const clampedRating = Math.max(0, Math.min(5, rating));
  return {
    restaurant_id: String(id),
    name: String(name).trim(),
    location_city: city,
    cuisines,
    cost_for_two: costForTwo,
    cost_bucket: costBucket,
    rating: Number(clampedRating.toFixed(1)),
    additional_tags: additionalTags,
    searchable_text: `${name} ${city} ${cuisines.join(' ')} ${additionalTags.join(' ')}`.trim(),
  };
}

function preprocessDataset(rawRecords) {
  const normalized = [];
  let droppedCount = 0;

  rawRecords.forEach((record, index) => {
    const value = normalizeRestaurant(record, index);
    if (!value) {
      droppedCount += 1;
      return;
    }
    normalized.push(value);
  });

  return {
    normalized,
    stats: {
      input_count: rawRecords.length,
      normalized_count: normalized.length,
      dropped_count: droppedCount,
    },
  };
}

module.exports = {
  preprocessDataset,
};

