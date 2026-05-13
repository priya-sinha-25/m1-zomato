## Problem Statement: AI-Powered Restaurant Recommendations (Zomato-style)

Build an AI-powered restaurant recommendation service inspired by Zomato. The system should recommend restaurants by combining **structured restaurant data** with an **LLM** to produce personalized, human-like rankings and explanations.

## Objective
Design and implement an application that:

1. Accepts user preferences (e.g., location, budget, cuisine, rating threshold).
2. Uses a real-world restaurant dataset.
3. Leverages an LLM to generate personalized recommendations (rankings + explanations).
4. Displays results clearly and usefully to the user.

## System Requirements

### 1) Data Ingestion and Preprocessing
Load and preprocess the Zomato dataset from Hugging Face:
`https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation`

Extract relevant fields such as:
- Restaurant name
- Location
- Cuisine
- Cost / estimated spend (or cost bucket)
- Rating
- (Any other useful attributes present in the dataset)

### 2) User Input
Collect preferences from the user, for example:
- **Location** (e.g., Delhi, Bangalore)
- **Budget** (e.g., low, medium, high)
- **Cuisine** (e.g., Italian, Chinese)
- **Minimum rating**
- **Additional preferences** (e.g., family-friendly, quick service)

### 3) Integration / Candidate Selection
Before calling the LLM:
- Filter restaurants that match the user’s constraints (location, cuisine, minimum rating, budget bucket, etc.).
- Prepare a structured candidate list to send to the LLM (include only the fields needed for ranking and explanation).
- Design an LLM prompt that instructs the model to reason over the provided candidate data and produce an ordered recommendation list.

### 4) Recommendation Engine (LLM)
Use the LLM to:
- Rank the candidate restaurants.
- Provide an explanation for each recommendation (why it fits the user’s preferences).
- Optionally provide a short summary (e.g., “Top picks for your preferences”). 

### 5) Output Display
Present the top recommendations in a user-friendly format. For each restaurant, show:
- Restaurant Name
- Cuisine
- Rating
- Estimated Cost
- AI-generated explanation

## Acceptance Criteria
- Given a set of user preferences, the system returns a **top-N ranked list** of restaurants.
- Each recommended item includes the required fields (name, cuisine, rating, cost) plus a short explanation grounded in the candidate data.
- The pipeline is reproducible: dataset is loaded, candidates are filtered/structured, and then the LLM produces the final ranking.
