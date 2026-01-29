import os, json
import numpy as np
import joblib
from sklearn.svm import SVC

X, y = [], []

for user in os.listdir("training_data"):
    path = os.path.join("training_data", user, "raw_payload.json")
    if not os.path.exists(path):
        continue

    with open(path) as f:
        payload = json.load(f)

    touches = payload.get("touchEvents", [])
    presses = [t for t in touches if t["type"] == "press"]

    if len(presses) < 2:
        continue

    intervals = [
        presses[i]["timestamp"] - presses[i - 1]["timestamp"]
        for i in range(1, len(presses))
    ]

    X.append([
        np.mean(intervals),
        np.std(intervals),
        len(presses),
    ])
    y.append(user)

svm = SVC()
svm.fit(X, y)

joblib.dump(svm, "svm_touch.pkl")
print("✅ Touch model trained")
