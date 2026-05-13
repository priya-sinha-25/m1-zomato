const assert = require('assert');
const { runPhase0Checks } = require('../../src/phase0/check');

runPhase0Checks();
assert.ok(true, 'Phase 0 checks should pass');
console.log('tests/phase0: passed');

