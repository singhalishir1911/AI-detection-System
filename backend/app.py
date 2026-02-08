from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.model import predict_risk

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Diabetes Prediction API Running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    try:
        age = int(data["age"])
        glucose = float(data["glucose"])
        bp_raw = data["bloodPressure"]
        height_cm = float(data["heightCm"])
        weight_kg = float(data["weightKg"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    try:
        systolic, diastolic = map(int, bp_raw.split("/"))
    except:
        return jsonify({"error": "Invalid BP format"}), 400

    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 2)

    pima_input = [
        0,          # Pregnancies
        glucose,
        diastolic,
        0,          # SkinThickness
        0,          # Insulin
        bmi,
        0.5,        # DiabetesPedigreeFunction
        age
    ]

    result = predict_risk(pima_input)

    return jsonify({
        "diabetesRisk": result["risk"],
        "confidence": result["confidence"]
    })

if __name__ == "__main__":
    app.run(debug=True)