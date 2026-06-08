import sys
import os

# Add phase4 to the python path so the inner "src" package can be resolved
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(base_dir, "phase4"))

from src.milestone1.phase8_streamlit import app

if __name__ == "__main__":
    app.main()
