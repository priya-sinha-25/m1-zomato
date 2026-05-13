const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { runOrchestration } = require('../orchestrator');

const app = express();
app.use(cors());
app.use(express.json());

// Phase 6 Observability: Basic Request Latency & Status Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms\n`;
    fs.appendFileSync(path.join(__dirname, 'metrics.log'), logLine);
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/recommend', async (req, res) => {
  try {
    const rawPreferences = req.body;
    
    // Load the dataset
    const datasetPath = path.join(__dirname, '..', '..', 'phase1', 'output', 'normalized-restaurants.json');
    if (!fs.existsSync(datasetPath)) {
        return res.status(500).json({ success: false, error: "Dataset not found. Please run phase 1 first." });
    }
    const datasetRecords = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    // Call Orchestrator
    const result = await runOrchestration(rawPreferences, datasetRecords);
    
    // The orchestrator returns {success: true, data: ...} or {success: false, fallback/error: ...}
    res.json(result);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Phase 5 API/UI running on http://localhost:${PORT}`);
});
