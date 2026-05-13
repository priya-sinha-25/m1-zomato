const fs = require('fs');
const path = require('path');
const { runOrchestration } = require('../../orchestrator');

const SCENARIOS_PATH = path.join(__dirname, 'scenarios.json');
const DATASET_PATH = path.join(__dirname, '..', '..', '..', 'phase1', 'output', 'normalized-restaurants.json');
const REPORT_PATH = path.join(__dirname, 'evaluation-report.json');

async function runEvaluation() {
  console.log("--- PHASE 6: OFFLINE EVALUATION ---");
  
  if (!fs.existsSync(DATASET_PATH)) {
    console.error("Error: Dataset not found at", DATASET_PATH);
    process.exit(1);
  }
  
  const datasetRecords = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
  
  const report = {
    timestamp: new Date().toISOString(),
    total_scenarios: scenarios.length,
    passed: 0,
    failed: 0,
    average_latency_ms: 0,
    results: []
  };

  let totalLatency = 0;

  for (const scenario of scenarios) {
    console.log(`\nEvaluating Scenario: ${scenario.scenario_id} - ${scenario.description}`);
    const startTime = Date.now();
    
    try {
      const result = await runOrchestration(scenario.preferences, datasetRecords);
      const latency = Date.now() - startTime;
      totalLatency += latency;
      
      const actualStatus = result.success ? "success" : (result.fallback ? "fallback" : "error");
      const passed = actualStatus === scenario.expected_status;
      
      if (passed) report.passed++;
      else report.failed++;

      report.results.push({
        scenario_id: scenario.scenario_id,
        latency_ms: latency,
        expected_status: scenario.expected_status,
        actual_status: actualStatus,
        passed,
        recommendation_count: result.data && result.data.recommendations ? result.data.recommendations.length : 0,
        error: result.error || null
      });

      console.log(`  -> Passed: ${passed ? 'Yes 🟢' : 'No 🔴'} | Latency: ${latency}ms | Status: ${actualStatus}`);
      
    } catch (err) {
      console.error(`  -> Unhandled Error in scenario ${scenario.scenario_id}:`, err);
      report.failed++;
      report.results.push({
        scenario_id: scenario.scenario_id,
        passed: false,
        error: err.message
      });
    }
  }

  report.average_latency_ms = Math.round(totalLatency / scenarios.length);
  
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n✅ Evaluation complete. Report saved to ${REPORT_PATH}`);
  console.log(`Summary: ${report.passed}/${report.total_scenarios} passed. Avg latency: ${report.average_latency_ms}ms`);
}

if (require.main === module) {
  runEvaluation().catch(console.error);
}

module.exports = { runEvaluation };
