const { selectCandidates } = require('../src/phase2/filter');
const { buildCandidatePayload } = require('../src/phase2/payload');
const { normalizePreferences } = require('../src/phase2/preferences');
const { generatePrompt } = require('../phase3/prompt');
const { validateLLMResponse } = require('../phase3/validator');
const { checkGrounding } = require('../phase3/heuristics');
const { callGroqLLM } = require('./llm-client');
const { generateTraceId, writeTrace } = require('./logger');

async function runOrchestration(rawPreferences, datasetRecords) {
  const traceId = generateTraceId();
  const startTime = Date.now();
  const logData = {
    trace_id: traceId,
    timestamp: new Date().toISOString(),
    input_preferences: rawPreferences,
    steps: []
  };

  try {
    // Step 1: Filtering
    const prefs = normalizePreferences(rawPreferences);
    const { candidates, meta } = selectCandidates(datasetRecords, prefs);
    
    logData.steps.push({
      step: 'filtering',
      meta,
      candidate_count: candidates.length
    });

    // Fallback Policy: If no candidates match, return early
    if (candidates.length === 0) {
      logData.status = 'fallback';
      logData.message = 'No restaurants found matching your criteria. Try relaxing your budget, cuisine, or rating constraints.';
      writeTrace(traceId, logData);
      return { success: false, fallback: true, message: logData.message };
    }

    // Step 2: Payload and Prompt Building
    const payload = buildCandidatePayload(candidates);
    const promptObj = generatePrompt(prefs, payload);

    logData.steps.push({
      step: 'prompt_generation',
      prompt_version: promptObj.version,
      system_prompt: promptObj.systemPrompt,
      user_prompt: promptObj.userPrompt
    });

    // Step 3: Call LLM
    const llmRawResponse = await callGroqLLM(promptObj.systemPrompt, promptObj.userPrompt);
    
    logData.steps.push({
      step: 'llm_call',
      raw_response: llmRawResponse
    });

    // Step 4: Validation and Heuristics
    const validationResult = validateLLMResponse(llmRawResponse);
    if (!validationResult.isValid) {
      logData.status = 'error';
      logData.error = 'Schema validation failed';
      logData.validation_errors = validationResult.errors;
      writeTrace(traceId, logData);
      return { success: false, error: 'The AI model returned an invalid response structure.', details: validationResult.errors };
    }

    const groundingResult = checkGrounding(validationResult.parsedResponse, payload);
    if (!groundingResult.isGrounded) {
       logData.status = 'error';
       logData.error = 'Grounding heuristics failed';
       logData.grounding_errors = groundingResult.errors;
       writeTrace(traceId, logData);
       return { success: false, error: 'The AI model hallucinated facts.', details: groundingResult.errors };
    }

    // Success
    logData.status = 'success';
    logData.final_recommendations = validationResult.parsedResponse;
    logData.duration_ms = Date.now() - startTime;
    writeTrace(traceId, logData);

    return {
      success: true,
      traceId,
      data: validationResult.parsedResponse
    };

  } catch (error) {
    logData.status = 'error';
    logData.error = error.message;
    logData.stack = error.stack;
    writeTrace(traceId, logData);
    
    return { success: false, error: 'An unexpected error occurred in the orchestration pipeline.', details: error.message };
  }
}

module.exports = {
  runOrchestration
};
