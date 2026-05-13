const fs = require('fs');
const path = require('path');
const { validateAgainstSchema, resolveRef } = require('../phase0/check');

function validateLLMResponse(responseJson) {
  const contractsPath = path.join(__dirname, '../phase0/contracts.json');
  const contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
  
  const responseSchema = resolveRef(
    contracts,
    contracts.properties.recommendationResponseSchema.$ref
  );
  
  let parsedResponse;
  if (typeof responseJson === 'string') {
    try {
      parsedResponse = JSON.parse(responseJson);
    } catch (e) {
      return {
        isValid: false,
        errors: [`Failed to parse LLM response as JSON: ${e.message}`]
      };
    }
  } else {
    parsedResponse = responseJson;
  }
  
  const errors = validateAgainstSchema(
    contracts,
    responseSchema,
    parsedResponse,
    'recommendationResponse'
  );
  
  return {
    isValid: errors.length === 0,
    errors,
    parsedResponse: errors.length === 0 ? parsedResponse : null
  };
}

module.exports = {
  validateLLMResponse
};
