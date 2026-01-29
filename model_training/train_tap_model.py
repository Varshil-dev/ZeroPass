import os, json, joblib
import numpy as np
from sklearn.svm import OneClassSVM

X = []

for user in os.listdir("training_data"):
    path = f"training_data/{user}/tap.json"
    if not os.path.exists(path):
        continue

    with open(path) as f:
        taps = json.load(f).get("taps", [])

    if len(taps) < 5:
        continue

    X.append([
        np.mean([t["reactionTime"] for t in taps]),
        np.mean([t["distance"] for t in taps])
    ])

X = np.array(X)
model = OneClassSVM(gamma="scale", nu=0.1)
model.fit(X)

os.makedirs("../backend/models/tap", exist_ok=True)
joblib.dump(model, "../backend/models/tap/tap_ocsvm.pkl")

print("✅ Tap model trained")
