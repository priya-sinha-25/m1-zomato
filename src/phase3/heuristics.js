function checkGrounding(parsedResponse, candidatePayload) {
  const errors = [];

  if (!parsedResponse || !parsedResponse.recommendations) {
    return { isGrounded: false, errors: ['Invalid response format. Missing recommendations.'] };
  }

  for (const rec of parsedResponse.recommendations) {
    const candidate = candidatePayload.find(c => c.restaurant_id === rec.restaurant_id);
    if (!candidate) {
      errors.push(`Recommendation contains unknown restaurant_id: ${rec.restaurant_id}`);
      continue;
    }

    // Heuristic 1: Explanation shouldn't invent ratings.
    const ratingMatches = rec.explanation.match(/\b([0-5]\.\d)\b/g);
    if (ratingMatches) {
      for (const match of ratingMatches) {
        if (parseFloat(match) !== candidate.rating && parseFloat(match) !== 5.0) {
          errors.push(`Restaurant ${candidate.restaurant_id} explanation mentions rating ${match} but actual rating is ${candidate.rating}`);
        }
      }
    }

    // Heuristic 2: Cuisines mentioned should be in the candidate's cuisine list
    const candidateCuisines = (candidate.cuisine || '').toLowerCase().split(',').map(c => c.trim());
    const commonCuisines = ['indian', 'chinese', 'italian', 'mexican', 'american', 'thai', 'japanese', 'mediterranean'];
    
    for (const cuisine of commonCuisines) {
      const regex = new RegExp(`\\b${cuisine}\\b`, 'i');
      if (regex.test(rec.explanation) && !candidateCuisines.some(c => c.includes(cuisine))) {
        errors.push(`Restaurant ${candidate.restaurant_id} explanation hallucinates cuisine ${cuisine}`);
      }
    }
    
    // Heuristic 3: Check explanation length
    if (rec.explanation.length < 10) {
       errors.push(`Restaurant ${candidate.restaurant_id} explanation is too short (${rec.explanation.length} chars).`);
    }
  }

  return {
    isGrounded: errors.length === 0,
    errors
  };
}

module.exports = {
  checkGrounding
};
