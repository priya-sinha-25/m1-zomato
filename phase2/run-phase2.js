const { runPhase2 } = require('../src/phase2/run-phase2');

const result = runPhase2(process.argv);
  console.log('Phase 2 candidate selection complete.');
console.log(`Input records: ${result.inputCount}`);
console.log(`Strict matches: ${result.meta.strict_match_count}`);
console.log(`Selected (top-k): ${result.meta.selected_count}`);
console.log(`Relaxation applied: ${result.meta.relaxation_applied}`);
console.log(`Output directory: ${result.outputDir}`);

