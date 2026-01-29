import os
import json
import numpy as np
import joblib
from sklearn.svm import OneClassSVM

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "training_data")

X = []

for user_id in os.listdir(DATA_DIR):
    user_dir = os.path.join(DATA_DIR, user_id)
    swipe_path = os.path.join(user_dir, "swipe.json")

    if not os.path.exists(swipe_path):
        continue

    with open(swipe_path, "r") as f:
        data = json.load(f)

    swipes = data.get("swipes", [])
    if len(swipes) < 5:
        continue  # not enough data

    for s in swipes:
        X.append([
            s.get("duration", 0),
            s.get("speed", 0),
            s.get("distance", 0)
        ])

X = np.array(X)

print("Loaded swipe samples:", X.shape)

# -----------------------
# Train One-Class SVM
# -----------------------
model = OneClassSVM(kernel="rbf", gamma="scale", nu=0.1)
model.fit(X)

os.makedirs("../backend/models/swipe", exist_ok=True)
joblib.dump(model, "../backend/models/swipe/swipe_svm.pkl")

print("✅ Swipe model trained successfully")
