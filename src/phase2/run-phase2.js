const fs = require('fs');
const path = require('path');
const { normalizePreferences } = require('./preferences');
const { selectCandidates } = require('./filter');
const { buildCandidatePayload } = require('./payload');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseArgs(argv) {
  const args = {
    input: path.join(__dirname, '..', '..', 'phase1', 'output', 'normalized-restaurants.json'),
    preferences: path.join(__dirname, '..', '..', 'phase2', 'config', 'sample-preferences.json'),
    outputDir: path.join(__dirname, '..', '..', 'phase2', 'output'),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--input' && next) args.input = next;
    if (arg === '--preferences' && next) args.preferences = next;
    if (arg === '--outputDir' && next) args.outputDir = next;
  }
  return args;
}

function runPhase2(argv = process.argv) {
  const args = parseArgs(argv);
  const records = readJson(args.input);
  const rawPrefs = readJson(args.preferences);
  const prefs = normalizePreferences(rawPrefs);

  const { candidates, meta } = selectCandidates(records, prefs);
  const payload = buildCandidatePayload(candidates);

  const outputDir = path.resolve(args.outputDir);
  writeJson(path.join(outputDir, 'selected-candidates.json'), candidates);
  writeJson(path.join(outputDir, 'llm-candidate-payload.json'), payload);
  writeJson(path.join(outputDir, 'selection-metadata.json'), {
    preferences: prefs,
    ...meta,
  });

  return {
    inputCount: records.length,
    outputDir,
    meta,
  };
}

if (require.main === module) {
  const result = runPhase2();
  console.log('Phase 2 candidate selection complete.');
  console.log(`Input records: ${result.inputCount}`);
  console.log(`Strict matches: ${result.meta.strict_match_count}`);
  console.log(`Selected (top-k): ${result.meta.selected_count}`);
  console.log(`Relaxation applied: ${result.meta.relaxation_applied}`);
  console.log(`Output directory: ${result.outputDir}`);
}

module.exports = {
  runPhase2,
};

