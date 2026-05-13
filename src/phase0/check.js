const fs = require('fs');
const path = require('path');

function readJson(relativePath) {
  const absolute = path.join(__dirname, relativePath);
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveRef(schemaRoot, ref) {
  if (!ref.startsWith('#/')) {
    throw new Error(`Unsupported $ref format: ${ref}`);
  }
  const parts = ref.slice(2).split('/');
  let node = schemaRoot;
  for (const part of parts) {
    node = node[part];
    if (node === undefined) {
      throw new Error(`Unable to resolve $ref: ${ref}`);
    }
  }
  return node;
}

function validateAgainstSchema(schemaRoot, schemaNode, value, valuePath = 'root') {
  if (schemaNode.$ref) {
    const target = resolveRef(schemaRoot, schemaNode.$ref);
    return validateAgainstSchema(schemaRoot, target, value, valuePath);
  }

  if (schemaNode.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return [`${valuePath} must be an object`];
    }

    const errors = [];
    const required = schemaNode.required || [];
    const properties = schemaNode.properties || {};

    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${valuePath}.${key} is required`);
      }
    }

    if (schemaNode.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(`${valuePath}.${key} is not allowed`);
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(
          ...validateAgainstSchema(schemaRoot, propertySchema, value[key], `${valuePath}.${key}`)
        );
      }
    }

    return errors;
  }

  if (schemaNode.type === 'array') {
    if (!Array.isArray(value)) {
      return [`${valuePath} must be an array`];
    }
    const errors = [];
    if (typeof schemaNode.minItems === 'number' && value.length < schemaNode.minItems) {
      errors.push(`${valuePath} must have at least ${schemaNode.minItems} items`);
    }
    if (schemaNode.items) {
      value.forEach((item, index) => {
        errors.push(
          ...validateAgainstSchema(schemaRoot, schemaNode.items, item, `${valuePath}[${index}]`)
        );
      });
    }
    return errors;
  }

  if (schemaNode.type === 'string') {
    if (typeof value !== 'string') {
      return [`${valuePath} must be a string`];
    }
    const errors = [];
    if (typeof schemaNode.minLength === 'number' && value.length < schemaNode.minLength) {
      errors.push(`${valuePath} must be at least ${schemaNode.minLength} chars`);
    }
    if (schemaNode.pattern) {
      const re = new RegExp(schemaNode.pattern);
      if (!re.test(value)) {
        errors.push(`${valuePath} does not match required pattern`);
      }
    }
    if (Array.isArray(schemaNode.enum) && !schemaNode.enum.includes(value)) {
      errors.push(`${valuePath} must be one of: ${schemaNode.enum.join(', ')}`);
    }
    return errors;
  }

  if (schemaNode.type === 'number' || schemaNode.type === 'integer') {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return [`${valuePath} must be a number`];
    }
    if (schemaNode.type === 'integer' && !Number.isInteger(value)) {
      return [`${valuePath} must be an integer`];
    }
    const errors = [];
    if (typeof schemaNode.minimum === 'number' && value < schemaNode.minimum) {
      errors.push(`${valuePath} must be >= ${schemaNode.minimum}`);
    }
    if (typeof schemaNode.maximum === 'number' && value > schemaNode.maximum) {
      errors.push(`${valuePath} must be <= ${schemaNode.maximum}`);
    }
    return errors;
  }

  return [];
}

function validateConfig(config) {
  assert(config.defaults, 'Missing defaults in config.json');
  assert(typeof config.defaults.top_n === 'number', 'defaults.top_n must be a number');
  assert(config.defaults.top_n >= 1, 'defaults.top_n must be >= 1');
  assert(
    config.defaults.top_n <= config.defaults.max_top_n,
    'defaults.top_n cannot exceed defaults.max_top_n'
  );
  assert(
    Array.isArray(config.allowed_budget_buckets) &&
      config.allowed_budget_buckets.includes('low') &&
      config.allowed_budget_buckets.includes('medium') &&
      config.allowed_budget_buckets.includes('high'),
    'allowed_budget_buckets must include low, medium, high'
  );
}

function validateContracts(contracts) {
  assert(contracts.$schema, 'Missing $schema in contracts.json');
  assert(contracts.$defs, 'Missing $defs in contracts.json');
  assert(
    contracts.properties && contracts.properties.restaurantRecordSchema,
    'Missing properties.restaurantRecordSchema'
  );
  assert(
    contracts.properties && contracts.properties.recommendationResponseSchema,
    'Missing properties.recommendationResponseSchema'
  );

  const sampleRestaurantRecord = {
    restaurant_id: 'rest_123',
    name: 'Sample Kitchen',
    location_city: 'Bangalore',
    cuisines: ['Indian', 'Chinese'],
    cost_for_two: 800,
    cost_bucket: 'medium',
    rating: 4.2,
    additional_tags: ['family-friendly'],
  };

  const sampleRecommendationResponse = {
    request_id: 'req_001',
    prompt_version: 'v1.0.0',
    top_n: 3,
    summary: 'Top picks for your preferences',
    recommendations: [
      {
        restaurant_id: 'rest_123',
        restaurant_name: 'Sample Kitchen',
        cuisine: 'Indian',
        rating: 4.2,
        estimated_cost_for_two: 800,
        explanation: 'Matches your preferred cuisine and rating threshold.',
      },
    ],
  };

  const restaurantSchema = resolveRef(contracts, contracts.properties.restaurantRecordSchema.$ref);
  const responseSchema = resolveRef(
    contracts,
    contracts.properties.recommendationResponseSchema.$ref
  );

  const restaurantErrors = validateAgainstSchema(
    contracts,
    restaurantSchema,
    sampleRestaurantRecord,
    'restaurantRecord'
  );
  const responseErrors = validateAgainstSchema(
    contracts,
    responseSchema,
    sampleRecommendationResponse,
    'recommendationResponse'
  );

  assert(
    restaurantErrors.length === 0,
    `Restaurant schema validation failed: ${restaurantErrors.join('; ')}`
  );
  assert(
    responseErrors.length === 0,
    `Response schema validation failed: ${responseErrors.join('; ')}`
  );
}

function validatePromptVersioning(promptVersioning, config) {
  assert(promptVersioning.active_version, 'Missing active_version');
  const active = promptVersioning.versions.find(
    (version) => version.version === promptVersioning.active_version
  );
  assert(active, 'active_version not found in versions[]');
  assert(
    config.defaults.prompt_version === promptVersioning.active_version,
    'Config prompt version and prompt-versioning active_version must match'
  );
}

function runPhase0Checks() {
  const contracts = readJson('contracts.json');
  const config = readJson('config.json');
  const promptVersioning = readJson('prompt-versioning.json');

  validateConfig(config);
  validateContracts(contracts);
  validatePromptVersioning(promptVersioning, config);
}

if (require.main === module) {
  runPhase0Checks();
  console.log('Phase 0 checks passed.');
}

module.exports = {
  runPhase0Checks,
  validateAgainstSchema,
  resolveRef,
};

