import sys
import os

# Add phase4 directory to the python path so the backend imports work correctly
sys.path.insert(0, os.path.abspath("phase4"))

# Cloud entrypoint
from src.milestone1.phase8_streamlit.app import *
