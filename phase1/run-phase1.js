const { runPhase1 } = require('../src/phase1/run-phase1');

runPhase1(process.argv)
  .then(({ result }) => {
  console.log('Phase 1 pipeline complete.');
  console.log(`Output directory: ${result.outputDir}`);
  console.log(`Input: ${result.stats.input_count}`);
  console.log(`Normalized: ${result.stats.normalized_count}`);
  console.log(`Dropped: ${result.stats.dropped_count}`);
  })
  .catch((error) => {
  console.error(`Phase 1 pipeline failed: ${error.message}`);
  process.exit(1);
  });

