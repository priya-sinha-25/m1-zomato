# Streamlit Deployment Guide (Phase 8)

This guide covers how to run the Zomato AI Streamlit app locally and how to deploy it to Streamlit Community Cloud.

## Running Locally

1. **Install dependencies**:
   Ensure you have installed the project with the optional Streamlit dependencies.
   ```bash
   pip install -e ".[streamlit]"
   ```
   *(Or simply run `pip install streamlit` if you are just testing).*

2. **Run the App**:
   From the root of your repository (e.g., `phase4`), run:
   ```bash
   streamlit run streamlit_app.py
   ```

3. **Provide API Key**:
   When running locally, the app will read the `GROQ_API_KEY` from your environment variables. Ensure it is set before launching. If no key is found, the app will gracefully fall back to a deterministic mode for demonstration.

---

## Deploying to Streamlit Community Cloud

Streamlit Community Cloud provides a free and simple way to host your application on the web.

### 1. Prerequisites
- Your code must be pushed to a public or private GitHub repository.
- Ensure `streamlit_app.py` is at the root of the repository.

### 2. Connect to Streamlit Cloud
- Go to [share.streamlit.io](https://share.streamlit.io/) and log in with your GitHub account.
- Click on **"New app"**.
- Select your repository, branch, and set the **Main file path** to `streamlit_app.py`.

### 3. Add Secrets
Since you never commit `.env` files to GitHub, you need to securely provide your API key to the deployed app.
- Before clicking "Deploy", click on **"Advanced settings"**.
- In the **Secrets** text box, define your Groq API key:
  ```toml
  GROQ_API_KEY = "your_actual_groq_api_key_here"
  ```
- Save the settings.

### 4. Deploy!
- Click **"Deploy"**. Streamlit will build your environment (installing the dependencies defined in `pyproject.toml`) and launch the app.
- You will receive a shareable public URL (e.g., `https://your-app-name.streamlit.app`).

### Reviewer Testing
Once deployed, a reviewer can open the hosted URL, adjust the constraints, and click "Find Restaurants" to verify the end-to-end functionality of the AI recommendation system.
