
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Load the generated dataset
data = pd.read_csv("battery_cooling_dataset.csv")

# Select input features
X = data[
    [
        "battery_temperature",
        "coolant_temperature",
        "voltage",
        "current",
        "temperature_difference"
    ]
]

# Select target/output column
y = data["cooling_requirement"]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Create Random Forest classifier
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    max_depth=12,
    class_weight="balanced"
)

# Train the model
model.fit(X_train, y_train)
# Check training and testing accuracy separately
train_accuracy = model.score(X_train, y_train)
test_accuracy = model.score(X_test, y_test)

print("\nTraining Accuracy:", round(train_accuracy * 100, 2), "%")
print("Testing Accuracy:", round(test_accuracy * 100, 2), "%")

# Predict cooling requirements on test data
y_pred = model.predict(X_test)

# Evaluate model performance
accuracy = accuracy_score(y_test, y_pred)

print("Random Forest Model Training Completed!")
print("\nAccuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred, labels=["LOW", "MEDIUM", "HIGH"]))

# Save the trained model
joblib.dump(model, "random_forest_model.pkl")

print("\nTrained model saved successfully!")
