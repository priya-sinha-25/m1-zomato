# Human Evaluation Rubric: Recommendation Quality

Use this rubric to manually review and score samples from the `evaluation-report.json` or live API outputs to ensure the AI pipeline is maintaining high quality.

## 1. Grounding & Hallucination Prevention (Pass/Fail)
- **Pass**: The LLM output only mentions restaurants provided in the candidate payload. Ratings, prices, and cuisines mentioned in the explanation perfectly match the candidate data.
- **Fail**: The LLM hallucinates a restaurant that does not exist in the candidates, or invents facts (e.g., claiming a 3.8 rating restaurant is 4.5).

## 2. Formatting Compliance (1-5)
- **5**: Perfectly matches the expected JSON schema. No trailing commas or malformed keys.
- **3**: Valid JSON but contains unexpected additional keys or missing optional keys.
- **1**: Invalid JSON or severe structural deviation causing parser failure.

## 3. Explanation Quality & Relevance (1-5)
- **5**: Explanation is highly tailored to the user's explicit preferences (e.g., mentions specific cuisines or vibes requested) and uses an engaging, helpful tone.
- **3**: Generic explanation ("This is a good restaurant").
- **1**: Explanation contradicts user preferences (e.g., recommending a non-vegetarian place when vegetarian was requested) or is rude/unhelpful.
