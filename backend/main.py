from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, json

from behavioral_auth import BehavioralAuth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_engine = BehavioralAuth()

@app.get("/")
async def root():
    return {"message": "FastAPI backend running"}

# ============================
# SAVE TRAINING DATA
# ============================
@app.post("/api/save-payload")
async def save_payload(request: Request):
    payload = await request.json()

    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(400, "Missing userId")

    base_dir = os.path.join("training_data", user_id)
    os.makedirs(base_dir, exist_ok=True)

    with open(os.path.join(base_dir, "raw_payload.json"), "w") as f:
        json.dump(payload, f, indent=2)

    for key, name in [
        ("typingData", "keystroke.json"),
        ("swipeData", "swipe.json"),
        ("tapData", "tap.json"),
        ("motionData", "motion.json"),
    ]:
        if payload.get(key):
            with open(os.path.join(base_dir, name), "w") as f:
                json.dump(payload[key], f, indent=2)

    return {"message": "Training data saved"}

# ============================
# CONTINUOUS AUTH (STUB SAFE)
# ============================
@app.post("/api/continuous-auth")
async def continuous_auth(request: Request):
    payload = await request.json()
    return {
        "authenticated": True,
        "anomaly": False,
        "confidence": 1.0
    }

@app.post("/api/authenticate")
async def authenticate_user(request: Request):
    try:
        payload = await request.json()

        result = auth_engine.authenticate(
            payload=payload,
            claimed_user=payload.get("userId")
        )

        return result

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "authenticated": False,
                "confidence": 0.0,
                "error": str(e)
            }
        )

@app.get("/api/test")
async def test():
    return {"message": "API working"}
