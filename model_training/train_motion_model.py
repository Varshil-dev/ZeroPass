import os, json, joblib
import numpy as np
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

DATA_DIR = "training_data"
OUT_DIR = "../backend/models/motion"
os.makedirs(OUT_DIR, exist_ok=True)

X = []

for user in os.listdir(DATA_DIR):
    path = os.path.join(DATA_DIR, user, "motion.json")
    if not os.path.exists(path):
        continue

    with open(path) as f:
        data = json.load(f)

    sensor = data.get("sensorData", {})
    acc = sensor.get("accelerometer", [])
    gyro = sensor.get("gyroscope", [])

    if len(acc) < 10 or len(gyro) < 10:
        continue

    ax = [a["x"] for a in acc]
    ay = [a["y"] for a in acc]
    az = [a["z"] for a in acc]

    gx = [g["x"] for g in gyro]
    gy = [g["y"] for g in gyro]
    gz = [g["z"] for g in gyro]

    X.append([
        np.mean(ax), np.std(ax),
        np.mean(ay), np.std(ay),
        np.mean(az), np.std(az),
        np.mean(gx), np.std(gx),
        np.mean(gy), np.std(gy),
        np.mean(gz), np.std(gz),
    ])

X = np.array(X)

if len(X) == 0:
    raise RuntimeError("❌ No motion samples found — check motion.json structure")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = OneClassSVM(gamma="scale", nu=0.1)
model.fit(X_scaled)

joblib.dump(model, os.path.join(OUT_DIR, "motion_ocsvm.pkl"))
joblib.dump(scaler, os.path.join(OUT_DIR, "motion_scaler.pkl"))

print("✅ Motion model trained successfully")
