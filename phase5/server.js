const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { runOrchestration } = require('../phase4/orchestrator');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/recommend', async (req, res) => {
  try {
    const rawPreferences = req.body;
    
    // Load the dataset
    const datasetPath = path.join(__dirname, '..', 'phase1', 'output', 'normalized-restaurants.json');
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
