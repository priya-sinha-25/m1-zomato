const assert = require('assert');
const { preprocessDataset } = require('../../src/phase1/normalize');

const input = [
  {
    id: '1',
    restaurant_name: 'Test One',
    city: 'Bengaluru',
    cuisines: 'North Indian, Chinese',
    'approx_cost(for two people)': '800',
    rate: '4.3/5',
  },
  {
    id: '2',
    restaurant_name: '',
    city: 'Delhi',
    cuisines: 'Italian',
    'approx_cost(for two people)': '1200',
    rate: '4.1/5',
  },
];

const result = preprocessDataset(input);
assert.strictEqual(result.stats.input_count, 2);
assert.strictEqual(result.stats.normalized_count, 1);
assert.strictEqual(result.stats.dropped_count, 1);
assert.strictEqual(result.normalized[0].location_city, 'Bangalore');
assert.strictEqual(result.normalized[0].cost_bucket, 'medium');
console.log('tests/phase1: passed');

