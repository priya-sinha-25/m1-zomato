const fs = require('fs');
const path = require('path');
const { runOrchestration } = require('./orchestrator');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

async function main() {
  console.log("--- PHASE 4: END-TO-END ORCHESTRATION ---\n");

  const datasetPath = path.join(__dirname, '..', 'phase1', 'output', 'normalized-restaurants.json');
  const prefsPath = path.join(__dirname, '..', 'phase2', 'config', 'sample-preferences.json');
  
  if (!fs.existsSync(datasetPath)) {
    console.error(`Error: Dataset not found at ${datasetPath}`);
    console.error(`Please make sure you have run Phase 1 to generate the dataset.`);
    process.exit(1);
  }

  const datasetRecords = readJson(datasetPath);
  const rawPreferences = readJson(prefsPath);

  console.log("Input Preferences:");
  console.dir(rawPreferences);
  console.log(`\nDataset loaded: ${datasetRecords.length} records.`);

  console.log("\nStarting Orchestrator pipeline...");
  const result = await runOrchestration(rawPreferences, datasetRecords);

  if (result.success) {
    console.log(`\n✅ Orchestration Successful (Trace ID: ${result.traceId})`);
    console.log("Final Recommendations:");
    console.log(JSON.stringify(result.data, null, 2));
  } else if (result.fallback) {
    console.log(`\n⚠️ Fallback Triggered: ${result.message}`);
  } else {
    console.log(`\n❌ Orchestration Failed: ${result.error}`);
    console.log(result.details);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main
};
