import os
import pickle
import numpy as np

# Get current file directory
base_path = os.path.dirname(__file__)

# Path to model file
model_path = os.path.join(base_path, "diabetes_model.pkl")

# Load trained model
with open(model_path, "rb") as file:
    model = pickle.load(file)


def predict_risk(data):
    """
    data should be a list:
    [Pregnancies, Glucose, BloodPressure, SkinThickness,
     Insulin, BMI, DiabetesPedigreeFunction, Age]
    """

    input_array = np.array(data).reshape(1, -1)

    probability = model.predict_proba(input_array)[0][1]

    if probability < 0.3:
        risk = "Low"
    elif probability < 0.7:
        risk = "Medium"
    else:
        risk = "High"
    return {
    "risk": risk,
    "confidence": float(round(probability * 100, 2))
}



# Testing block
if __name__ == "__main__":
    sample_input = [2, 120, 70, 20, 80, 25.5, 0.5, 35]

    result = predict_risk(sample_input)

    print("Prediction Result:")
    print(result)
