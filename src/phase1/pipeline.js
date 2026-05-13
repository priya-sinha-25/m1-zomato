const fs = require('fs');
const path = require('path');
const { loadRawDataset } = require('./loader');
const { preprocessDataset } = require('./normalize');

function writeJsonFile(targetPath, data) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function runPhase1Pipeline(options) {
  const rawRecords = await loadRawDataset(options);
  const { normalized, stats } = preprocessDataset(rawRecords);

  const now = new Date().toISOString();
  const outputDir = path.resolve(options.outputDir || path.join(__dirname, '..', '..', 'phase1', 'output'));

  writeJsonFile(path.join(outputDir, 'normalized-restaurants.json'), normalized);
  writeJsonFile(path.join(outputDir, 'ingestion-metadata.json'), {
    source: options.mode === 'local' ? 'local' : 'huggingface',
    dataset: options.dataset || 'ManikaSaini/zomato-restaurant-recommendation',
    config: options.config || 'default',
    split: options.split || 'train',
    offset: options.offset || 0,
    length: options.length || 200,
    generated_at_utc: now,
    stats,
  });

  return {
    outputDir,
    stats,
  };
}

module.exports = {
  runPhase1Pipeline,
};

