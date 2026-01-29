import os
import json
import numpy as np
import joblib
from tensorflow.keras.models import load_model

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def pad_sequence(seq, max_len=30):
    seq = seq[:max_len]
    return seq + [0.0] * (max_len - len(seq))


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


# --------------------------------------------------
# Behavioral Authentication Engine
# --------------------------------------------------
class BehavioralAuth:
    def __init__(self):
        base = os.path.dirname(__file__)
        model_dir = os.path.join(base, "models")

        # ---------- Keystroke ----------
        self.ks_cnn = load_model(
            os.path.join(model_dir, "keystroke", "keystroke_cnn.h5"),
            compile=False
        )
        self.ks_svm = joblib.load(
            os.path.join(model_dir, "keystroke", "keystroke_svm.pkl")
        )
        self.ks_knn = joblib.load(
            os.path.join(model_dir, "keystroke", "keystroke_knn.pkl")
        )
        self.ks_scaler = joblib.load(
            os.path.join(model_dir, "keystroke", "keystroke_scaler.pkl")
        )

        # ---------- Tap ----------
        self.tap_model = joblib.load(
            os.path.join(model_dir, "tap", "tap_ocsvm.pkl")
        )

        # ---------- Swipe ----------
        self.swipe_model = joblib.load(
            os.path.join(model_dir, "swipe", "swipe_svm.pkl")
        )

        # ---------- Motion ----------
        self.motion_model = joblib.load(
            os.path.join(model_dir, "motion", "motion_ocsvm.pkl")
        )
        self.motion_scaler = joblib.load(
            os.path.join(model_dir, "motion", "motion_scaler.pkl")
        )

    # --------------------------------------------------
    # Keystroke scoring (CNN + SVM + KNN)
    # --------------------------------------------------
    def score_keystroke(self, keystroke_json):
        attempts = keystroke_json.get("attempts", [])
        if not attempts:
            return 0.0

        attempt = attempts[0]
        if len(attempt) < 5:
            return 0.0

        hold = pad_sequence([e["holdTime"] for e in attempt])
        delay = pad_sequence([e["interKeyDelay"] for e in attempt])

        X = np.array(hold + delay).reshape(1, 30, 2)

        # CNN embedding
        embedding = self.ks_cnn.predict(X, verbose=0)

        # Scale
        emb_scaled = self.ks_scaler.transform(embedding)

        # SVM score
        svm_score = self.ks_svm.decision_function(emb_scaled)[0]
        svm_score = sigmoid(svm_score)

        # KNN similarity
        distances, _ = self.ks_knn.kneighbors(emb_scaled)
        knn_score = np.exp(-np.mean(distances))

        # CNN confidence proxy
        cnn_score = np.mean(embedding)

        return float((svm_score + knn_score + cnn_score) / 3)

    # --------------------------------------------------
    # Tap scoring
    # --------------------------------------------------
    def score_tap(self, tap_json):
        taps = tap_json.get("taps", [])
        if len(taps) < 3:
            return 0.0

        X = np.array([[
            np.mean([t["reactionTime"] for t in taps]),
            np.mean([t["distance"] for t in taps])
        ]])

        score = self.tap_model.decision_function(X)[0]
        return float(sigmoid(score))

    # --------------------------------------------------
    # Swipe scoring
    # --------------------------------------------------
    def score_swipe(self, swipe_json):
        swipes = swipe_json.get("swipes", [])
        if len(swipes) < 3:
            return 0.0

        X = np.array([[
            np.mean([s["duration"] for s in swipes]),
            np.mean([s["speed"] for s in swipes]),
            np.mean([s["distance"] for s in swipes])
        ]])

        score = self.swipe_model.decision_function(X)[0]
        return float(sigmoid(score))

    # --------------------------------------------------
    # Motion scoring
    # --------------------------------------------------
    def score_motion(self, motion_json):
        sensor = motion_json.get("sensorData", {})
        acc = sensor.get("accelerometer", [])
        gyro = sensor.get("gyroscope", [])

        if len(acc) < 10 or len(gyro) < 10:
            return 0.0

        X = np.array([[
            np.mean([a["x"] for a in acc]), np.std([a["x"] for a in acc]),
            np.mean([a["y"] for a in acc]), np.std([a["y"] for a in acc]),
            np.mean([a["z"] for a in acc]), np.std([a["z"] for a in acc]),
            np.mean([g["x"] for g in gyro]), np.std([g["x"] for g in gyro]),
            np.mean([g["y"] for g in gyro]), np.std([g["y"] for g in gyro]),
            np.mean([g["z"] for g in gyro]), np.std([g["z"] for g in gyro]),
        ]])

        Xs = self.motion_scaler.transform(X)
        score = self.motion_model.decision_function(Xs)[0]
        return float(sigmoid(score))

    # --------------------------------------------------
    # FINAL AUTHENTICATION (Decision-level fusion)
    # --------------------------------------------------
    def authenticate(self, payload, claimed_user=None):
        scores = []

        if payload.get("keystrokeData"):
            scores.append(self.score_keystroke(payload["keystrokeData"]))

        if payload.get("tapData"):
            scores.append(self.score_tap(payload["tapData"]))

        if payload.get("swipeData"):
            scores.append(self.score_swipe(payload["swipeData"]))

        if payload.get("motionData"):
            scores.append(self.score_motion(payload["motionData"]))

        if not scores:
            return {
                "authenticated": False,
                "confidence": 0.0,
                "reason": "No usable behavioral data"
            }

        confidence = float(np.mean(scores))
        authenticated = confidence >= 0.6

        return {
            "authenticated": authenticated,
            "confidence": confidence,
            "scores": scores
        }
