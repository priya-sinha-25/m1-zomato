const fs = require('fs');
const path = require('path');

function getActivePromptVersion() {
  const versioningPath = path.join(__dirname, '../phase0/prompt-versioning.json');
  const versioningData = JSON.parse(fs.readFileSync(versioningPath, 'utf8'));
  
  const activeVersion = versioningData.versions.find(
    (v) => v.version === versioningData.active_version
  );
  
  if (!activeVersion) {
    throw new Error('Active prompt version not found in versioning file.');
  }
  
  return activeVersion;
}

function generatePrompt(userPreferences, candidatePayload) {
  const versionInfo = getActivePromptVersion();
  
  const systemPrompt = `You are an AI-powered restaurant recommendation assistant.
Your task is to review a list of candidate restaurants and rank them based on the user's preferences.
You must return your output strictly as a JSON object matching the provided schema.

Prompt Version: ${versionInfo.version}
Purpose: ${versionInfo.purpose}

Rules:
${versionInfo.notes.map(note => `- ${note}`).join('\n')}

Required Output Fields for each recommendation:
${versionInfo.required_output_fields.join(', ')}

Ensure that your explanations are well-reasoned, concise, and absolutely grounded in the provided candidate data. Do not invent any facts about the restaurants, their ratings, costs, or cuisines.`;

  const userPrompt = `User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Candidate Restaurants:
${JSON.stringify(candidatePayload, null, 2)}

Please provide your final top recommendations formatted as a JSON object matching the recommendationResponseSchema.
Include a summary of your top picks.
`;

  return {
    systemPrompt,
    userPrompt,
    version: versionInfo.version
  };
}

module.exports = {
  generatePrompt,
  getActivePromptVersion
};
