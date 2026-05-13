const assert = require('assert');
const { normalizePreferences } = require('../../src/phase2/preferences');
const { selectCandidates } = require('../../src/phase2/filter');
const { buildCandidatePayload } = require('../../src/phase2/payload');

const records = [
  {
    restaurant_id: 'a',
    name: 'A',
    location_city: 'Bangalore',
    cuisines: ['Chinese'],
    cost_for_two: 900,
    cost_bucket: 'medium',
    rating: 4.5,
    additional_tags: ['quick service'],
    searchable_text: 'A Bangalore Chinese quick service',
  },
  {
    restaurant_id: 'b',
    name: 'B',
    location_city: 'Delhi',
    cuisines: ['Italian'],
    cost_for_two: 1200,
    cost_bucket: 'medium',
    rating: 4.7,
    additional_tags: [],
    searchable_text: 'B Delhi Italian',
  },
];

const prefs = normalizePreferences({
  location: 'Bengaluru',
  cuisine: 'Chinese',
  budget_bucket: 'medium',
  min_rating: 4.0,
  top_k: 5,
});

const { candidates, meta } = selectCandidates(records, prefs);
assert.ok(candidates.length >= 1, 'Expected at least one candidate');
assert.strictEqual(meta.selected_count, candidates.length);
const payload = buildCandidatePayload(candidates);
assert.strictEqual(payload.length, candidates.length);
assert.ok(payload[0].restaurant_name);
console.log('tests/phase2: passed');

