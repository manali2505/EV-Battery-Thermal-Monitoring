# EV Battery Thermal Monitoring Dashboard

**Project ID:** KJS-CES-02  
**Institute Case Study:** AI-Enabled Micro-channel Battery Thermal Management System for Electric Vehicles

## 1. Project Overview

The EV Battery Thermal Monitoring Dashboard is a full-stack web application developed to monitor electric vehicle battery operating conditions and identify potential thermal risks.

The application allows authenticated users to register battery configurations, submit sensor readings, view thermal risk classifications, predict cooling requirements using a machine learning model, and monitor historical battery performance.

The project implements a React frontend, Spring Boot REST backend, MongoDB database, and a Python Flask-based machine learning service.

## 2. Objectives

- Register and manage electric vehicle battery configurations.
- Record battery temperature, voltage, and current readings.
- Identify potential thermal risks using predefined temperature thresholds.
- Predict battery cooling requirements using a machine learning model.
- Store battery configurations, sensor readings, and prediction results in MongoDB.
- Display historical readings and temperature trends.
- Implement JWT-based authentication and secure API access.
- Provide API documentation and testing through Swagger UI.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js |
| Routing | React Router |
| HTTP Communication | Axios |
| Backend | Java 17, Spring Boot |
| Database | MongoDB |
| Intelligent Feature | Python, Flask, Machine Learning |
| Authentication | Spring Security, JWT |
| Password Security | BCrypt Password Encoder |
| API Documentation | Swagger UI, OpenAPI |
| API Testing | Postman |
| Development Environment | Visual Studio Code |

## 4. Main Features

1. **User Registration and Login:** Users can register and log in using a username and password. Passwords are stored as BCrypt hashes.

2. **JWT Authentication:** The backend generates JWT access tokens after successful login. Protected API endpoints require a valid Bearer token.

3. **Protected Frontend Pages:** Dashboard, Battery Management, Sensor Readings, Reading History, and Alerts pages require authentication.

4. **Battery Registration:** Register battery details such as battery ID, type, nominal voltage, voltage limits, and temperature thresholds.

5. **Sensor Data Entry:** Submit battery temperature, voltage, current, and coolant temperature through the frontend.

6. **Thermal Risk Classification:** Classify readings as NORMAL, WARNING, or CRITICAL using configured temperature thresholds.

7. **Cooling Requirement Prediction:** A Python-based machine learning service predicts cooling requirements as LOW, MEDIUM, or HIGH.

8. **Historical Monitoring:** Retrieve and display previously stored battery readings and prediction results.

9. **Temperature Visualization:** Display historical temperature trends through dashboard charts.

10. **API Documentation:** Swagger UI provides interactive documentation and testing of REST API endpoints.

## 5. System Architecture

The application follows a layered full-stack architecture with a separate machine learning service.

- **Frontend:** React provides the user interface, authentication pages, dashboard, forms, charts, and historical monitoring.
- **Backend:** Spring Boot exposes REST APIs, validates incoming data, manages authentication, performs thermal risk classification, and communicates with MongoDB and the Flask service.
- **Database:** MongoDB stores user accounts, battery configurations, sensor readings, and prediction-related records.
- **Machine Learning Service:** A Python Flask service receives relevant sensor parameters and returns the predicted cooling requirement.

### Application Workflow

1. User logs in through the React frontend.
2. React sends authentication requests to Spring Boot.
3. Spring Boot validates credentials and returns a JWT.
4. React includes the JWT in subsequent protected API requests.
5. Users register batteries and submit sensor readings.
6. Spring Boot validates the readings and calculates the thermal risk level.
7. Spring Boot communicates with the Flask machine learning service for cooling requirement prediction.
8. Sensor readings and prediction results are stored in MongoDB.
9. React displays the results, historical records, alerts, and dashboard information.

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

Stores battery sensor readings and their calculated thermal risk and associated prediction information.

- id
- batteryId
- temperature
- voltage
- current
- riskLevel
- timestamp

### User

Stores registered user account information.

- id
- username
- password (BCrypt encoded)
- role

The battery configuration and reading records are logically associated through `batteryId`. One battery can have multiple sensor readings.

**Note:** Coolant temperature is currently collected by the frontend for the cooling prediction workflow. It is not persisted as a separate field in the battery reading document.

## 7. REST API Endpoints

### Authentication APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user and generate a JWT |

### Battery Configuration APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/batteries` | Retrieve all registered batteries |
| GET | `/api/batteries/{batteryId}` | Retrieve a battery by ID |
| POST | `/api/batteries` | Register a new battery |

### Battery Reading APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/readings` | Retrieve all readings |
| GET | `/api/readings/battery/{batteryId}` | Retrieve readings for a battery |
| POST | `/api/readings` | Submit a new sensor reading |

**Authentication:** Authentication and registration endpoints are publicly accessible. The protected application APIs require a valid JWT in the Authorization header.

Example:

`Authorization: Bearer <your-access-token>`

### Swagger Documentation

Swagger UI is available at:

`http://localhost:8080/swagger-ui/index.html`

OpenAPI documentation is available at:

`http://localhost:8080/v3/api-docs`

The Swagger interface supports Bearer token authorization for testing protected endpoints.

## 8. Running the Project Locally

### Prerequisites

- Java 17
- Node.js and npm
- MongoDB Server
- Python
- Flask and required Python dependencies
- Maven (the backend includes the Maven wrapper)

### Step 1: Start MongoDB

Ensure that the MongoDB server is running locally.

The application uses the database:

`ev_battery_thermal`

### Step 2: Start the Machine Learning Service

Open a terminal in the directory containing `app.py`.

Install the required Python dependencies:

```powershell
pip install flask pandas numpy scikit-learn
```

Alternatively, if the project contains a `requirements.txt` file, install the dependencies using:

```powershell
pip install -r requirements.txt
```

Start the Flask application:

```powershell
python app.py
```

The Flask machine learning service runs at:

`http://localhost:5000`

Keep this terminal running while using the cooling requirement prediction feature.

### Step 3: Start the Backend

Open a terminal in the Spring Boot backend directory containing `mvnw.cmd`.

Set the JWT secret as an environment variable in PowerShell:

```powershell
$env:JWT_SECRET="your-own-random-secret-of-at-least-32-characters"
```

Start the backend:

```powershell
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend runs at:

`http://localhost:8080`

### Step 4: Start the Frontend

Open another terminal in the React frontend directory.

Install dependencies:

```powershell
npm install
```

Start the React application:

```powershell
npm start
```

The React application runs at:

`http://localhost:3000`

## 9. Thermal Risk Classification

The backend uses predefined temperature thresholds configured for each battery.

- **NORMAL:** Temperature is below the warning threshold.
- **WARNING:** Temperature has reached the warning threshold but has not reached the critical threshold.
- **CRITICAL:** Temperature has reached or exceeded the critical threshold.

The backend also validates important sensor inputs, including temperature, voltage, and current limits.

This threshold-based classification is separate from the machine learning cooling requirement prediction.

## 10. Machine Learning-Based Cooling Requirement Prediction

The application integrates a Python Flask-based machine learning service to predict battery cooling requirements.

The model considers relevant battery operating parameters, including:

- Battery temperature
- Coolant temperature
- Voltage
- Current

The prediction is classified into three levels:

- **LOW:** Low cooling requirement.
- **MEDIUM:** Moderate cooling requirement.
- **HIGH:** High cooling requirement.

Spring Boot communicates with the Flask service through an API and integrates the prediction result into the application workflow.

The prediction results are stored along with the relevant monitoring records as implemented in the backend.

If the prediction service is unavailable, the backend returns an appropriate error response instead of presenting a failed prediction as a successful result.

## 11. Security Implementation

The application implements authentication and API security using Spring Security and JWT.

- User registration and login are provided through authentication REST APIs.
- Passwords are encoded using BCrypt before storage.
- Successful login generates a signed JWT access token.
- Protected backend endpoints require a valid Bearer token.
- Requests without valid authentication are rejected.
- React protected routes redirect unauthenticated users to the Login page.
- The JWT secret is supplied through an environment variable rather than hardcoded in the source code.
- Swagger UI supports Bearer token authorization for protected API testing.

## 12. Validation and Error Handling

The application includes validation and error handling to improve reliability.

- Required user registration and login fields are validated.
- Duplicate usernames are rejected.
- Password length is validated during registration.
- Invalid sensor readings are rejected by backend validation.
- Unauthorized API requests return an appropriate HTTP error response.
- Machine learning service failures are handled without displaying a false successful prediction.

## 13. Testing and Verification

The following tests were performed during implementation:

| Test Case | Expected Result |
|---|---|
| Register a new user | User registered successfully |
| Login with valid credentials | JWT access token generated |
| Login with invalid credentials | Authentication rejected |
| Access protected API without token | Unauthorized response |
| Access protected API with valid token | Request accepted |
| Access frontend page after logout | Redirected to Login |
| Submit invalid sensor temperature | Bad Request response |
| Stop the Flask service and request prediction | Service failure handled |
| Submit valid sensor readings | Reading and prediction workflow completed |
| Restart Spring Boot backend | Previously stored records remain available |
| Open Swagger UI | API documentation displayed |
| Authorize a protected Swagger endpoint | Protected API request succeeds |

## 14. Project Status

The project implements an end-to-end battery thermal monitoring workflow with frontend, backend, database, authentication, and machine learning integration.

The implementation demonstrates the following:

1. User registration and authentication.
2. JWT-based protection of backend APIs.
3. Protected React application pages.
4. Battery registration and configuration management.
5. Sensor data collection and validation.
6. Rule-based thermal risk classification.
7. Machine learning-based cooling requirement prediction.
8. MongoDB data persistence.
9. Historical monitoring and visualization.
10. Swagger-based API documentation and testing.

## 15. Limitations and Future Enhancements

- Integration with physical EV battery sensors for continuous real-time monitoring.
- Persist coolant temperature as a dedicated database field.
- Improve predictive accuracy using larger and more diverse battery datasets.
- Add role-based access control if required.
- Explore deployment to a cloud environment.
- Improve predictive maintenance and battery health analysis.

---

**Project:** EV Battery Thermal Monitoring Dashboard  
**Institute Use Case:** KJS-CES-02  
**Application Area:** Climate, Energy, and Sustainability