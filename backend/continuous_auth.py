import os
import numpy as np
import joblib


# ===============================
# Continuous Authentication Model
# ===============================
class ContinuousAuthModel:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))

        # -------------------------------
        # Load Motion Model (Optional)
        # -------------------------------
        try:
            self.svm_motion = joblib.load(
                os.path.join(base_dir, "models/motion/motion_osvm.pkl")
            )
            self.motion_enabled = True
        except Exception:
            self.motion_enabled = False

        # -------------------------------
        # Load Touch Model (Optional)
        # -------------------------------
        try:
            self.svm_touch = joblib.load(
                os.path.join(base_dir, "models/gesture/swipe_svm.pkl")
            )
            self.touch_enabled = True
        except Exception:
            self.touch_enabled = False

    # ===============================
    # Feature Extraction
    # ===============================
    def _motion_features(self, motion_data):
        accel = motion_data.get("accelerometer", [])
        if not accel:
            return None

        x = np.array([a.get("x", 0) for a in accel])
        y = np.array([a.get("y", 0) for a in accel])
        z = np.array([a.get("z", 0) for a in accel])

        sma = np.mean(np.abs(x) + np.abs(y) + np.abs(z))

        return np.array([
            x.mean(), y.mean(), z.mean(),
            x.std(), y.std(), z.std(),
            sma,
        ])

    def _touch_features(self, touch_events):
        presses = [e for e in touch_events if e.get("type") == "press"]
        if len(presses) < 2:
            return None

        intervals = [
            presses[i]["timestamp"] - presses[i - 1]["timestamp"]
            for i in range(1, len(presses))
        ]

        return np.array([
            np.mean(intervals),
            np.std(intervals),
            len(presses),
        ])

    # ===============================
    # Continuous Authentication
    # ===============================
    def authenticate(self, payload: dict):
        votes = []

        user_id = payload.get("userId")

        # ---------- Motion ----------
        if self.motion_enabled and payload.get("motionData"):
            motion_feat = self._motion_features(payload["motionData"])
            print("Motion features:", motion_feat)
            if motion_feat is not None:
                pred = self.svm_motion.predict([motion_feat])[0]
                print("Motion prediction:", pred)
                votes.append(pred == user_id)

        # ---------- Touch ----------
        if self.touch_enabled and payload.get("touchEvents"):
            touch_feat = self._touch_features(payload["touchEvents"])
            print("Touch features:", touch_feat)
            if touch_feat is not None:
                pred = self.svm_touch.predict([touch_feat])[0]
                print("Touch prediction:", pred)
                votes.append(pred == user_id)

        # ---------- Final Decision ----------
        if not votes:
            # No reliable data → do NOT lock user
            return {
                "authenticated": True,
                "anomaly": False,
                "confidence": 1.0,
                "reason": "Insufficient data"
            }

        confidence = sum(votes) / len(votes)
        authenticated = confidence >= 0.6

        result = {
            "authenticated": authenticated,
            "anomaly": not authenticated,
            "confidence": confidence,
            "votes": votes,
        }
        print('[Continuous Auth] Result:', result)
        return result
