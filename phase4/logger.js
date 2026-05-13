const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateTraceId() {
  return crypto.randomBytes(8).toString('hex');
}

function writeTrace(traceId, logData) {
  const tracesDir = path.join(__dirname, 'output', 'traces');
  fs.mkdirSync(tracesDir, { recursive: true });
  
  const filePath = path.join(tracesDir, `trace_${traceId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), 'utf8');
  
  return filePath;
}

module.exports = {
  generateTraceId,
  writeTrace
};
