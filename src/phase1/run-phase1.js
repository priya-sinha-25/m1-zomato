const path = require('path');
const { runPhase1Pipeline } = require('./pipeline');

function parseArgs(argv) {
  const args = {
    mode: 'local',
    localPath: path.join(__dirname, '..', '..', 'phase1', 'data', 'sample-raw-restaurants.json'),
    outputDir: path.join(__dirname, '..', '..', 'phase1', 'output'),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--mode' && next) args.mode = next;
    if (arg === '--localPath' && next) args.localPath = next;
    if (arg === '--outputDir' && next) args.outputDir = next;
    if (arg === '--dataset' && next) args.dataset = next;
    if (arg === '--config' && next) args.config = next;
    if (arg === '--split' && next) args.split = next;
    if (arg === '--offset' && next) args.offset = Number(next);
    if (arg === '--length' && next) args.length = Number(next);
  }

  return args;
}

async function runPhase1(argv = process.argv) {
  const options = parseArgs(argv);
  const result = await runPhase1Pipeline(options);
  return { options, result };
}

if (require.main === module) {
  runPhase1()
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
}

module.exports = {
  runPhase1,
};

