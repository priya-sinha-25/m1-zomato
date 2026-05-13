const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama3-8b-8192';

async function callGroqLLM(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("WARNING: GROQ_API_KEY not found in environment. Using mock LLM response.");
    return getMockResponse(userPrompt);
  }

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Groq API returned an empty or invalid response structure.');
  }

  return content;
}

function getMockResponse(userPrompt) {
  let recs = [];
  try {
    // Try to extract CANDIDATES block from prompt
    const candidatesMatch = userPrompt.match(/\[\s*\{.*\}\s*\]/s);
    if (candidatesMatch) {
      const candidates = JSON.parse(candidatesMatch[0]);
      recs = candidates.slice(0, 5).map(c => ({
        restaurant_id: c.restaurant_id,
        restaurant_name: c.name || c.restaurant_name,
        cuisine: Array.isArray(c.cuisines) ? c.cuisines.join(', ') : (c.cuisine || "Unknown"),
        rating: c.rating,
        estimated_cost_for_two: c.cost_for_two || 1000,
        explanation: "Excellent choice that matches your preferences perfectly. Highly recommended!"
      }));
    }
  } catch (e) {
    console.error("Mock parse error:", e.message);
  }

  if (recs.length === 0) {
    recs = [
      {
        restaurant_id: "rest_1",
        restaurant_name: "Mock Restaurant 1",
        cuisine: "Indian",
        rating: 4.5,
        estimated_cost_for_two: 800,
        explanation: "Mock explanation for restaurant 1."
      }
    ];
  }

  return JSON.stringify({
    request_id: `mock_${Date.now()}`,
    prompt_version: "v1.0.0",
    top_n: recs.length,
    summary: "Mock summary of top restaurants",
    recommendations: recs
  });
}

module.exports = {
  callGroqLLM
};
