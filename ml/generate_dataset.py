
import pandas as pd
import numpy as np

# Generate reproducible synthetic battery sensor data
np.random.seed(42)

number_of_records = 5000

# Generate realistic prototype sensor readings
battery_temperature = np.random.uniform(20, 65, number_of_records)
coolant_temperature = np.random.uniform(15, 45, number_of_records)
voltage = np.random.uniform(300, 420, number_of_records)
current = np.random.uniform(5, 150, number_of_records)

# Calculate the difference between battery and coolant temperature
temperature_difference = battery_temperature - coolant_temperature

# Assign cooling requirement labels using transparent prototype rules
cooling_requirement = []

for i in range(number_of_records):

    temp = battery_temperature[i]
    coolant = coolant_temperature[i]
    difference = temperature_difference[i]

    if temp >= 50 or (temp >= 45 and difference >= 15):
        cooling_requirement.append("HIGH")

    elif temp >= 38 or coolant >= 35 or difference >= 12:
        cooling_requirement.append("MEDIUM")

    else:
        cooling_requirement.append("LOW")

# Create a dataset
data = pd.DataFrame({
    "battery_temperature": battery_temperature,
    "coolant_temperature": coolant_temperature,
    "voltage": voltage,
    "current": current,
    "temperature_difference": temperature_difference,
    "cooling_requirement": cooling_requirement
})

# Save the dataset
data.to_csv("battery_cooling_dataset.csv", index=False)

print("Dataset generated successfully!")
print("Total records:", len(data))
print("\nFirst five records:")
print(data.head())

print("\nCooling requirement distribution:")
print(data["cooling_requirement"].value_counts())
