
import pandas as pd
import joblib

# Load the trained Random Forest model
model = joblib.load("random_forest_model.pkl")

# Define 10 new battery sensor test cases
test_cases = pd.DataFrame([
    [28, 20, 380, 35],
    [35, 25, 375, 45],
    [42, 28, 380, 65],
    [48, 30, 370, 80],
    [55, 32, 380, 90],
    [60, 35, 390, 110],
    [38, 36, 365, 50],
    [45, 40, 380, 75],
    [32, 42, 375, 30],
    [52, 25, 400, 120]
], columns=[
    "battery_temperature",
    "coolant_temperature",
    "voltage",
    "current"
])

# Calculate temperature difference
test_cases["temperature_difference"] = (
    test_cases["battery_temperature"]
    - test_cases["coolant_temperature"]
)

# Arrange features in the same order used during training
features = test_cases[
    [
        "battery_temperature",
        "coolant_temperature",
        "voltage",
        "current",
        "temperature_difference"
    ]
]

# Predict cooling requirement
predictions = model.predict(features)

# Add predictions to the table
test_cases["predicted_cooling_requirement"] = predictions

# Display results
print("\nRANDOM FOREST - BATTERY COOLING PREDICTION RESULTS")
print("=" * 90)

print(test_cases.to_string(index=False))

# Save results to CSV
test_cases.to_csv("test_predictions.csv", index=False)

print("\nTotal test cases:", len(test_cases))
print("Prediction results saved to test_predictions.csv")
