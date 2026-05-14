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
    st.set_page_config(page_title="Zomato AI", page_icon="🍔", layout="wide")

    # Inject Custom CSS
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
        
        html, body, [class*="css"] {
            font-family: 'Inter', sans-serif;
        }
        .stButton>button {
            background-color: #E23744;
            color: white;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 4px 14px 0 rgba(226, 55, 68, 0.39);
            font-weight: 600;
            width: 100%;
        }
        .stButton>button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(226, 55, 68, 0.23);
            background-color: #ff4757;
            color: white;
        }
        .rec-card {
            transition: all 0.3s ease;
            padding: 1.5rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 1.5rem;
        }
        .rec-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(226, 55, 68, 0.5);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .rec-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #E23744;
            margin-bottom: 0.5rem;
        }
        .rec-subtitle {
            font-size: 0.9rem;
            color: #aaa;
            margin-bottom: 1rem;
        }
        .rec-explanation {
            font-size: 1rem;
            line-height: 1.5;
            color: #e0e0e0;
        }
        h1 {
            font-weight: 800 !important;
            letter-spacing: -1px;
            margin-bottom: 0 !important;
        }
        .hero-subtitle {
            font-size: 1.2rem;
            color: #a0a0a0;
            margin-bottom: 2rem;
        }
        </style>
    """, unsafe_allow_html=True)

    st.title("Zomato AI")
    st.markdown('<div class="hero-subtitle">Find your perfect meal based on smart filters and AI analysis.</div>', unsafe_allow_html=True)

    # Main search area
    st.markdown("### Where to?")
    col1, col2 = st.columns(2)
    with col1:
        location = st.text_input("City/Location", value="Bellandur", help="Enter a city or neighborhood")
    with col2:
        cuisine = st.text_input("Cuisine", value="", help="e.g. Italian, North Indian, Cafe")
        
    st.markdown("<br/>", unsafe_allow_html=True)
    
    # Secondary filters in sidebar
    with st.sidebar:
        st.header("Refine Search 🎯")
        budget = st.selectbox("Budget Bucket", ["low", "medium", "high"], index=2)
        min_rating = st.slider("Minimum Rating", 1.0, 5.0, 4.0, 0.1)
        extra = st.text_area("Specific Cravings", value="", placeholder="e.g. outdoor seating, romantic, spicy...")

    # Action row
    _, action_col, _ = st.columns([1, 2, 1])
    with action_col:
        submit = st.button("Discover Restaurants ✨")

    st.markdown("---")

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
                    st.success(f"Found {len(recs)} great recommendations just for you!")
                    st.markdown("<br/>", unsafe_allow_html=True)
                    
                    for r in recs:
                        st.markdown(f'''
                            <div class="rec-card">
                                <div class="rec-title">{r.get('restaurant_name', 'Unknown')}</div>
                                <div class="rec-subtitle">{r.get('cuisine', 'Various')}</div>
                                <div class="rec-explanation">{r.get('explanation', '')}</div>
                            </div>
                        ''', unsafe_allow_html=True)
                        
                        # Use columns for metrics just below the card
                        m1, m2, m3 = st.columns(3)
                        m1.metric("Rating", f"★ {r.get('rating', 'N/A')}")
                        m2.metric("Cost for Two", f"₹{r.get('estimated_cost_for_two', 'N/A')}")
                        st.markdown("<br/>", unsafe_allow_html=True)
                        
                    with st.expander("🛠️ Show AI Telemetry"):
                        st.json({"candidates_filtered": len(filtered), "llm_response_raw": llm_response})

if __name__ == "__main__":
    main()
