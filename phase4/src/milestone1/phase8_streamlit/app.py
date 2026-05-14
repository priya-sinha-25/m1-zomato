import streamlit as st
import json
import os

# Set dummy API key if missing for fallback demo
os.environ.setdefault("GROQ_API_KEY", "")

from src.milestone1.phase1_ingestion.loader import load_restaurants
from src.milestone1.phase2_preferences.models import UserPreferences, preferences_from_mapping
from src.milestone1.phase3_integration.filter import filter_and_rank
from src.milestone1.phase3_integration.prompt import build_prompt_payload
from src.milestone1.phase4_llm.client import recommend_with_groq

def main():
    st.set_page_config(page_title="Zomato AI Recommendations", page_icon="🍔", layout="centered")

    st.title("Zomato AI Recommendations 🍔")
    st.write("Find your perfect meal based on smart filters and AI analysis.")

    with st.sidebar:
        st.header("Your Preferences")
        location = st.text_input("City/Location", value="Bellandur")
        budget = st.selectbox("Budget", ["low", "medium", "high"], index=2)
        cuisine = st.text_input("Cuisine", value="")
        min_rating = st.slider("Minimum Rating", 1.0, 5.0, 4.0, 0.1)
        extra = st.text_area("Additional Preferences", value="")
        submit = st.button("Find Restaurants")

    if submit:
        with st.spinner("Analyzing dataset & querying AI..."):
            candidates = load_restaurants()
            
            raw_prefs = {
                "location": location,
                "budget_bucket": budget,
                "cuisine": cuisine,
                "min_rating": min_rating,
                "additional_preferences": extra,
                "top_k": 5
            }
            prefs = preferences_from_mapping(raw_prefs)
            
            filtered = filter_and_rank(candidates, prefs)
            
            if not filtered:
                st.warning("No restaurants match filters. Try relaxing your constraints.")
            else:
                sys_prompt, user_prompt = build_prompt_payload(filtered, prefs)
                llm_response = recommend_with_groq(sys_prompt, user_prompt, filtered)
                recs = llm_response.get("recommendations", [])
                
                if not recs:
                    st.error("LLM could not justify picks or encountered an error.")
                else:
                    st.success(f"Found {len(recs)} great recommendations!")
                    for r in recs:
                        with st.expander(f"{r.get('restaurant_name', 'Unknown')} - ★ {r.get('rating', 'N/A')}", expanded=True):
                            st.markdown(f"**Cuisine:** {r.get('cuisine', 'Various')} | **Cost:** ₹{r.get('estimated_cost_for_two', 'N/A')}")
                            st.write(r.get('explanation', ''))
                            
                    with st.expander("Show AI Telemetry"):
                        st.json({"candidates_filtered": len(filtered), "llm_response_raw": llm_response})

if __name__ == "__main__":
    main()
