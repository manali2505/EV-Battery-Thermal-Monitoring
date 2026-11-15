
from flask import Flask, request, jsonify
import pandas as pd
import joblib

# Create Flask application
app = Flask(__name__)
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "EV Battery Cooling ML API is running!",
        "status": "Active",
        "prediction_endpoint": "/predict"
    })
# Load the trained Random Forest model
model = joblib.load("random_forest_model.pkl")


# API endpoint for battery cooling prediction
@app.route("/predict", methods=["POST"])
def predict():

    try:
        # Receive sensor readings from the request
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON input is required"}), 400

        # Read input values
        battery_temperature = float(data["battery_temperature"])
        coolant_temperature = float(data["coolant_temperature"])
        voltage = float(data["voltage"])
        current = float(data["current"])

        # Validate input values
        if not all(map(lambda x: x == x and abs(x) != float("inf"),
                       [battery_temperature, coolant_temperature,
                        voltage, current])):
            return jsonify({"error": "Sensor values must be finite numbers"}), 400

        if not -40 <= battery_temperature <= 100:
            return jsonify({"error": "Invalid battery temperature"}), 400

        if not -40 <= coolant_temperature <= 100:
            return jsonify({"error": "Invalid coolant temperature"}), 400

        if not 0 < voltage <= 1000:
            return jsonify({"error": "Invalid voltage"}), 400

        if abs(current) > 1000:
            return jsonify({"error": "Invalid current"}), 400

        # Calculate temperature difference
        temperature_difference = (
            battery_temperature - coolant_temperature
        )

        # Prepare input in the same order used during model training
        input_data = pd.DataFrame([{
            "battery_temperature": battery_temperature,
            "coolant_temperature": coolant_temperature,
            "voltage": voltage,
            "current": current,
            "temperature_difference": temperature_difference
        }])

        # Predict cooling requirement
        prediction = model.predict(input_data)[0]

        # Return prediction as JSON
        return jsonify({
            "cooling_requirement": prediction,
            "battery_temperature": battery_temperature,
            "coolant_temperature": coolant_temperature,
            "voltage": voltage,
            "current": current,
            "temperature_difference": temperature_difference
        })

    except (KeyError, TypeError, ValueError):
        return jsonify({
            "error": "Please provide all sensor values as valid numbers"
        }), 400


# Start Flask server
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
