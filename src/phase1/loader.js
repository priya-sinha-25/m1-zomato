const fs = require('fs');
const path = require('path');
const https = require('https');

function readJsonFile(filePath) {
  const absolute = path.resolve(filePath);
  const raw = fs.readFileSync(absolute, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON in ${absolute}`);
  }
  return parsed;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`HTTP ${response.statusCode} from ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Invalid JSON response from ${url}: ${error.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function loadFromHuggingFaceRows({ dataset, config, split, offset, length }) {
  const endpoint = new URL('https://datasets-server.huggingface.co/rows');
  endpoint.searchParams.set('dataset', dataset);
  endpoint.searchParams.set('config', config);
  endpoint.searchParams.set('split', split);
  endpoint.searchParams.set('offset', String(offset));
  endpoint.searchParams.set('length', String(length));

  const body = await fetchJson(endpoint.toString());
  if (!Array.isArray(body.rows)) {
    throw new Error('Hugging Face rows API response missing rows[]');
  }

  return body.rows.map((entry) => entry.row || entry);
}

async function loadRawDataset(options) {
  if (options.mode === 'local') {
    return readJsonFile(options.localPath);
  }

  return loadFromHuggingFaceRows({
    dataset: options.dataset || 'ManikaSaini/zomato-restaurant-recommendation',
    config: options.config || 'default',
    split: options.split || 'train',
    offset: options.offset || 0,
    length: options.length || 200,
  });
}

module.exports = {
  loadRawDataset,
};

