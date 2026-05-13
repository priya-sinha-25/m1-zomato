from typing import Dict, Any

def render_empty_state(reason: str) -> Dict[str, Any]:
    if reason == "no_candidates":
        msg = "No restaurants match filters. Try relaxing your constraints."
    elif reason == "llm_failure":
        msg = "LLM could not justify picks or encountered an error."
    else:
        msg = "Unknown error occurred."
    return {"status": "empty", "message": msg, "data": []}

def format_recommendations(llm_response: Dict[str, Any], telemetry: Dict[str, Any] = None) -> Dict[str, Any]:
    recs = llm_response.get("recommendations", [])
    if not recs:
        return render_empty_state("llm_failure")
    return {
        "status": "success",
        "message": "Found great recommendations!",
        "data": recs,
        "telemetry": telemetry or {}
    }
