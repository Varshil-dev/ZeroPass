import os, json
import numpy as np
import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM
from sklearn.neighbors import NearestNeighbors

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Flatten, Dense, Input

# ------------------------
# Config
# ------------------------
DATA_DIR = "training_data"
MAX_LEN = 30
MODEL_OUT = "../backend/models/keystroke"
os.makedirs(MODEL_OUT, exist_ok=True)

# ------------------------
# Utils
# ------------------------
def pad_sequence(seq, max_len=MAX_LEN):
    seq = seq[:max_len]
    if len(seq) < max_len:
        seq += [0.0] * (max_len - len(seq))
    return seq

# ------------------------
# Load data
# ------------------------
X = []

for user in os.listdir(DATA_DIR):
    path = os.path.join(DATA_DIR, user, "keystroke.json")
    if not os.path.exists(path):
        continue

    with open(path) as f:
        data = json.load(f)

    attempts = data.get("attempts", [])
    if not attempts:
        continue

    # Use first attempt
    attempt = attempts[0]
    if len(attempt) < 5:
        continue

    hold = [e["holdTime"] for e in attempt]
    delay = [e["interKeyDelay"] for e in attempt]

    feat = pad_sequence(hold) + pad_sequence(delay)
    X.append(feat)

X = np.array(X)

if len(X) == 0:
    raise RuntimeError("❌ No keystroke samples found")

print("Keystroke samples:", X.shape)

# =========================================================
# 1️⃣ CNN – Feature Learner
# =========================================================
X_cnn = X.reshape((X.shape[0], MAX_LEN, 2))

cnn = Sequential([
    Input(shape=(MAX_LEN, 2)),
    Conv1D(32, 3, activation="relu"),
    MaxPooling1D(2),
    Flatten(),
    Dense(64, activation="relu"),
    Dense(16, activation="relu")  # <-- embedding
])

cnn.compile(
    optimizer="adam",
    loss="mse"
)

# Autoencoder-like training (self pattern)
cnn.fit(X_cnn, X_cnn.reshape(X.shape[0], -1)[:, :16],
        epochs=30, verbose=1)

cnn.save(os.path.join(MODEL_OUT, "keystroke_cnn.h5"))

# Extract embeddings
embeddings = cnn.predict(X_cnn)

# =========================================================
# 2️⃣ SVM – Boundary Model (Verification)
# =========================================================
scaler = StandardScaler()
E_scaled = scaler.fit_transform(embeddings)

svm = OneClassSVM(kernel="rbf", gamma="scale", nu=0.1)
svm.fit(E_scaled)

joblib.dump(svm, os.path.join(MODEL_OUT, "keystroke_svm.pkl"))
joblib.dump(scaler, os.path.join(MODEL_OUT, "keystroke_scaler.pkl"))

# =========================================================
# 3️⃣ KNN – Similarity Model
# =========================================================
knn = NearestNeighbors(n_neighbors=3, metric="euclidean")
knn.fit(E_scaled)

joblib.dump(knn, os.path.join(MODEL_OUT, "keystroke_knn.pkl"))

print("✅ Keystroke CNN + SVM + KNN trained successfully")
