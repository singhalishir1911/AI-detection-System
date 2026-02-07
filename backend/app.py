from flask import Flask, request, jsonify
import sys
import os

# Add ml folder to system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.model import predict_risk

app = Flask(__name__)

@app.route("/")
def home():
    return "Diabetes Prediction API Running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    user_input = [
        data["Pregnancies"],
        data["Glucose"],
        data["BloodPressure"],
        data["SkinThickness"],
        data["Insulin"],
        data["BMI"],
        data["DiabetesPedigreeFunction"],
        data["Age"]
    ]

    result = predict_risk(user_input)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
