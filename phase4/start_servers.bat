@echo off
echo ==========================================
echo Starting Zomato AI Backend (FastAPI)...
echo ==========================================
start "Zomato AI Backend" cmd /k "cd /d %~dp0 && pip install fastapi uvicorn pydantic groq datasets && uvicorn src.milestone1.api.main:app --reload"

echo.
echo ==========================================
echo Starting Zomato AI Frontend (Next.js)...
echo ==========================================
start "Zomato AI Frontend" cmd /k "cd /d %~dp0apps\web && npm install && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo Once the frontend finishes building, open your browser to http://localhost:3000
echo You can safely close this window.
