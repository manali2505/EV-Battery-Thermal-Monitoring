# EV Battery Thermal Monitoring Dashboard

**Project ID:** KJS-CES-02  
**Institute Case Study:** AI-Enabled Micro-channel Battery Thermal Management System for Electric Vehicles

## 1. Project Overview

The EV Battery Thermal Monitoring Dashboard is a web-based application designed to help electric vehicle battery monitoring and maintenance personnel monitor battery operating conditions and identify potential thermal risks.

The system allows users to register battery configurations, enter battery sensor readings, view thermal risk classifications, and monitor historical temperature trends through a dashboard.

## 2. Objectives

- Register and manage electric vehicle battery configurations.
- Record battery temperature, voltage, and current readings.
- Identify potential thermal risks using predefined temperature thresholds.
- Store sensor readings persistently in MongoDB.
- Display historical readings and temperature trends.
- Plan an AI-based cooling requirement prediction feature for a future phase.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js |
| HTTP communication | Axios |
| Backend | Java 17, Spring Boot |
| Database | MongoDB |
| API testing | Postman |
| Development environment | Visual Studio Code |

## 4. Main Features

1. **Battery Registration:** Register battery details such as battery ID, type, nominal voltage, voltage limits, and temperature thresholds.
2. **Sensor Data Entry:** Submit battery temperature, voltage, and current readings.
3. **Thermal Risk Classification:** Classify readings as NORMAL, WARNING, or CRITICAL using configured temperature thresholds.
4. **Historical Monitoring:** Retrieve and display previously stored battery readings.
5. **Temperature Visualization:** Display historical temperature trends using a chart.

## 5. System Architecture

The application follows a three-layer architecture:

- **Frontend:** React provides the dashboard and collects user input.
- **Backend:** Spring Boot exposes REST APIs, validates incoming data, performs thermal risk classification, and communicates with MongoDB.
- **Database:** MongoDB stores battery configurations and sensor readings.

A Python-based machine learning service is planned for a future phase to predict battery cooling requirements.

## 6. Database Entities

### BatteryConfiguration

Stores the configuration of each registered battery.

- id
- batteryId
- batteryType
- nominalVoltage
- minimumVoltage
- maximumVoltage
- warningTemperature
- criticalTemperature

### BatteryReading

Stores battery sensor readings and their calculated thermal risk.

- id
- batteryId
- temperature
- voltage
- current
- riskLevel
- timestamp

The two entities are logically associated through `batteryId`. One battery can have multiple sensor readings.

**Note:** Coolant temperature is currently collected by the frontend but is not persisted in the backend database.

## 7. REST API Endpoints

### Battery Configuration APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/batteries` | Retrieve all registered batteries |
| GET | `/api/batteries/{batteryId}` | Retrieve a battery by ID |
| POST | `/api/batteries` | Register a new battery |
| PUT | `/api/batteries/{batteryId}` | Update battery configuration |
| DELETE | `/api/batteries/{batteryId}` | Delete a battery configuration |

### Battery Reading APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/readings` | Retrieve all readings |
| GET | `/api/readings/{id}` | Retrieve a reading by ID |
| GET | `/api/readings/battery/{batteryId}` | Retrieve readings for a battery |
| POST | `/api/readings` | Submit a new sensor reading |
| PUT | `/api/readings/{id}` | Update an existing reading |
| DELETE | `/api/readings/{id}` | Delete a reading |

### Health API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend service status |

## 8. Running the Project Locally

### Prerequisites

- Java 17
- Node.js and npm
- MongoDB Server
- Maven (the backend also includes the Maven wrapper)

### Step 1: Start MongoDB

Ensure that the MongoDB server is running locally.

The application uses the database:

`ev_battery_thermal`

### Step 2: Start the Backend

Open a terminal in the `backend` directory and run:

```powershell
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend runs at:

`http://localhost:8080`

### Step 3: Start the Frontend

Open another terminal in the `frontend` directory and run:

```powershell
npm install
npm start
```

The React application runs at:

`http://localhost:3000`

## 9. Thermal Risk Classification

The current backend uses predefined temperature thresholds configured for each battery.

- **NORMAL:** Temperature is below the warning threshold.
- **WARNING:** Temperature has reached the warning threshold but has not reached the critical threshold.
- **CRITICAL:** Temperature has reached or exceeded the critical threshold.

The backend also validates sensor readings, including temperature, voltage, and current limits.

The current classification is rule-based; it is not an implemented machine learning model.

## 10. Planned AI-Based Feature

A machine learning feature is planned for a future phase to predict the battery cooling requirement.

The planned model will consider inputs such as battery temperature, coolant temperature, voltage, and current, and predict one of three cooling requirement levels:

- LOW
- MEDIUM
- HIGH

A Python-based machine learning service is planned to communicate with the Spring Boot backend through an API.

If the prediction service is unavailable or its prediction is uncertain, the system will continue to display the existing threshold-based thermal risk classification.

This feature is a future enhancement and is not currently implemented.

## 11. Project Status

The current implementation demonstrates an end-to-end working flow:

1. Register a battery through the React dashboard.
2. Send battery configuration data to Spring Boot using Axios.
3. Validate and save the configuration in MongoDB.
4. Enter battery sensor readings through the dashboard.
5. Send readings to the backend.
6. Calculate the thermal risk level and save the reading in MongoDB.
7. Display the result and historical readings in React.

The project is being developed in phases as part of the KJS School of Engineering mini-project.

## 12. Future Enhancements

- Integrate a trained machine learning model for cooling requirement prediction.
- Store and analyze coolant temperature readings in the backend.
- Improve battery monitoring visualizations.
- Add user authentication and role-based access.
- Explore integration with real-time battery sensor data.