const { generatePrompt } = require('./prompt');
const { validateLLMResponse } = require('./validator');
const { checkGrounding } = require('./heuristics');

// Mock data based on Phase 2 output and contracts
const userPreferences = {
  location_city: "Bangalore",
  cuisine: ["Indian"],
  min_rating: 4.0,
  max_cost: 1000,
  top_n: 2
};

const candidatePayload = [
  {
    rank_hint: 1,
    restaurant_id: "rest_1",
    restaurant_name: "Spice Garden",
    location_city: "Bangalore",
    cuisine: "Indian, Chinese",
    rating: 4.5,
    estimated_cost_for_two: 800,
    cost_bucket: "medium",
    matching_tags: ["family-friendly"]
  },
  {
    rank_hint: 2,
    restaurant_id: "rest_2",
    restaurant_name: "Curry House",
    location_city: "Bangalore",
    cuisine: "Indian",
    rating: 4.2,
    estimated_cost_for_two: 900,
    cost_bucket: "medium",
    matching_tags: []
  }
];

// Mocking the LLM's response
const mockLLMResponse = {
  request_id: "req_001",
  prompt_version: "v1.0.0",
  top_n: 2,
  summary: "Here are the top Indian restaurants in Bangalore based on your preferences.",
  recommendations: [
    {
      restaurant_id: "rest_1",
      restaurant_name: "Spice Garden",
      cuisine: "Indian, Chinese",
      rating: 4.5,
      estimated_cost_for_two: 800,
      explanation: "Spice Garden is highly rated at 4.5 and offers excellent Indian cuisine within your budget."
    },
    {
      restaurant_id: "rest_2",
      restaurant_name: "Curry House",
      cuisine: "Indian",
      rating: 4.2,
      estimated_cost_for_two: 900,
      explanation: "Curry House specializes in authentic Indian dishes with a solid 4.2 rating."
    }
  ]
};

// Also test a hallucinated response
const hallucinatedLLMResponse = {
  request_id: "req_002",
  prompt_version: "v1.0.0",
  top_n: 1,
  summary: "Top pick",
  recommendations: [
    {
      restaurant_id: "rest_1",
      restaurant_name: "Spice Garden",
      cuisine: "Indian, Chinese",
      rating: 4.5,
      estimated_cost_for_two: 800,
      explanation: "Spice Garden is rated 4.9 and serves great Italian food."
    }
  ]
};

function runPhase3() {
  console.log("--- PHASE 3: PROMPT GENERATION ---");
  const prompt = generatePrompt(userPreferences, candidatePayload);
  console.log(`Prompt Version: ${prompt.version}`);
  console.log(`System Prompt Length: ${prompt.systemPrompt.length}`);
  console.log(`User Prompt Length: ${prompt.userPrompt.length}`);
  console.log("\nSystem Prompt Sample:\n" + prompt.systemPrompt.substring(0, 150) + "...\n");
  
  console.log("--- PHASE 3: VALIDATION & HEURISTICS (Valid Response) ---");
  const validResult = validateLLMResponse(mockLLMResponse);
  if (validResult.isValid) {
    console.log("Schema Validation: PASSED");
    const groundingCheck = checkGrounding(validResult.parsedResponse, candidatePayload);
    if (groundingCheck.isGrounded) {
      console.log("Grounding Check: PASSED");
    } else {
      console.log("Grounding Check: FAILED");
      console.log(groundingCheck.errors);
    }
  } else {
    console.log("Schema Validation: FAILED");
    console.log(validResult.errors);
  }

  console.log("\n--- PHASE 3: VALIDATION & HEURISTICS (Hallucinated Response) ---");
  const invalidResult = validateLLMResponse(hallucinatedLLMResponse);
  if (invalidResult.isValid) {
    console.log("Schema Validation: PASSED");
    const groundingCheck = checkGrounding(invalidResult.parsedResponse, candidatePayload);
    if (groundingCheck.isGrounded) {
      console.log("Grounding Check: PASSED");
    } else {
      console.log("Grounding Check: FAILED (Expected)");
      groundingCheck.errors.forEach(e => console.log(` - ${e}`));
    }
  } else {
    console.log("Schema Validation: FAILED");
    console.log(invalidResult.errors);
  }
}

if (require.main === module) {
  runPhase3();
}

module.exports = {
  runPhase3
};
