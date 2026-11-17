
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BatteryManagement from "./pages/BatteryManagement";
import SensorReadings from "./pages/SensorReadings";
import ReadingHistory from "./pages/ReadingHistory";
import Alerts from "./pages/Alerts";
import React, { useState, useEffect } from "react";
import api from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import "./App.css";
function ProtectedRoute({ children }) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" replace />;
}
function App() {
  // Store the battery selected for sensor monitoring
  const [selectedBatteryId, setSelectedBatteryId] = useState("");

  // Store the details entered while registering a battery
  const [batteryId, setBatteryId] = useState("");
  const [batteryType, setBatteryType] = useState("Lithium-ion");
  const [nominalVoltage, setNominalVoltage] = useState("");
  const [minimumVoltage, setMinimumVoltage] = useState("");
  const [maximumVoltage, setMaximumVoltage] = useState("");
  const [warningTemperature, setWarningTemperature] = useState("");
  const [criticalTemperature, setCriticalTemperature] = useState("");

  // Store batteries received from the Spring Boot backend
  const [batteries, setBatteries] = useState([]);

  // Store registration success and error messages
  const [batteryMessage, setBatteryMessage] = useState("");
  const [batteryError, setBatteryError] = useState("");

  const [temperature, setTemperature] = useState("");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [coolantTemperature, setCoolantTemperature] = useState("");
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");

  // Store historical readings received from the backend
  const [historicalReadings, setHistoricalReadings] = useState([]);

  // Store the loading status while fetching historical readings
  const [historyLoading, setHistoryLoading] = useState(false);

  // Store errors related to historical readings
  const [historyError, setHistoryError] = useState("");

  // Load all registered batteries when the dashboard opens
  useEffect(() => {
    async function fetchBatteries() {
      try {
        const response = await api.get("/api/batteries");

        // Store the batteries received from the backend
        setBatteries(response.data);

      } catch (error) {
        console.error("Error loading batteries:", error);
        setBatteryError(
          "Unable to load registered batteries from the backend."
        );
      }
    }

    fetchBatteries();
  }, []);

  // Load historical readings whenever the selected battery changes
  useEffect(() => {

    // If no battery is selected, clear the historical readings
    if (!selectedBatteryId) {
      setHistoricalReadings([]);
      setHistoryError("");
      return;
    }

    async function fetchHistoricalReadings() {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        // Request previous readings for the selected battery
        const response = await api.get(
          `/api/readings/battery/${selectedBatteryId}`
        );

        // Sort readings by timestamp, newest first
        const sortedReadings = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setHistoricalReadings(sortedReadings);

      } catch (error) {
        console.error("Error loading historical readings:", error);

        setHistoricalReadings([]);
        setHistoryError(
          "Unable to load historical readings from the backend."
        );

      } finally {
        setHistoryLoading(false);
      }
    }

    fetchHistoricalReadings();

  }, [selectedBatteryId]);

  // Send the new battery configuration to the Spring Boot backend
  async function handleBatterySubmit(event) {
    event.preventDefault();

    // Clear previous messages
    setBatteryMessage("");
    setBatteryError("");

    // Convert the voltage and temperature fields into numbers
    const batteryData = {
      batteryId: batteryId.trim(),
      batteryType: batteryType.trim(),
      nominalVoltage: Number(nominalVoltage),
      minimumVoltage: Number(minimumVoltage),
      maximumVoltage: Number(maximumVoltage),
      warningTemperature: Number(warningTemperature),
      criticalTemperature: Number(criticalTemperature)
    };

    // Check that all fields have been entered
    if (
      !batteryData.batteryId ||
      !batteryData.batteryType ||
      nominalVoltage === "" ||
      minimumVoltage === "" ||
      maximumVoltage === "" ||
      warningTemperature === "" ||
      criticalTemperature === ""
    ) {
      setBatteryError("Please fill in all battery configuration fields.");
      return;
    }

    // Check that the entered values are valid numbers
    const numericValues = [
      batteryData.nominalVoltage,
      batteryData.minimumVoltage,
      batteryData.maximumVoltage,
      batteryData.warningTemperature,
      batteryData.criticalTemperature
    ];

    if (!numericValues.every(Number.isFinite)) {
      setBatteryError("Please enter valid numeric values.");
      return;
    }

    // Check that the voltage limits are in the correct order
    if (
      batteryData.minimumVoltage <= 0 ||
      batteryData.minimumVoltage >= batteryData.nominalVoltage ||
      batteryData.nominalVoltage >= batteryData.maximumVoltage
    ) {
      setBatteryError(
        "Voltage limits must follow: minimum < nominal < maximum."
      );
      return;
    }

    // Critical temperature must be higher than warning temperature
    if (
      batteryData.warningTemperature <= 0 ||
      batteryData.criticalTemperature <= batteryData.warningTemperature
    ) {
      setBatteryError(
        "Critical temperature must be higher than warning temperature."
      );
      return;
    }

    try {
      // Send the battery details to the Spring Boot REST API
      const response = await api.post("/api/batteries", batteryData);

      // Display a message after successful registration
      setBatteryMessage(
        `Battery ${response.data.batteryId} registered successfully!`
      );

      // Clear the form after successful registration
      setBatteryId("");
      setBatteryType("Lithium-ion");
      setNominalVoltage("");
      setMinimumVoltage("");
      setMaximumVoltage("");
      setWarningTemperature("");
      setCriticalTemperature("");

      // Add the newly registered battery to the displayed list
      setBatteries((previousBatteries) => [
        ...previousBatteries,
        response.data
      ]);

    } catch (error) {
      // Display the error returned by the backend
      setBatteryError(
        error.response?.data?.message ||
        "Battery registration failed. Please check the backend."
      );
    }
  }

  // Submit battery sensor readings to the Spring Boot backend
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // Check whether a battery has been selected
    if (!selectedBatteryId) {
      setError("Please select a registered battery.");
      return;
    }

    // Check whether all sensor fields are filled
    if (
      temperature === "" ||
      voltage === "" ||
      current === "" ||
      coolantTemperature === ""
    ) {
      setError("Please fill in all sensor fields.");
      return;
    }

    // Convert input values into numbers
    const temp = Number(temperature);
    const volt = Number(voltage);
    const amps = Number(current);
    const coolant = Number(coolantTemperature);

    // Validate the sensor values
    if (
      ![temp, volt, amps, coolant].every(Number.isFinite) ||
      temp < -40 || temp > 100 ||
      volt <= 0 ||
      amps < -1000 || amps > 1000 ||
      coolant < -40 || coolant > 100
    ) {
      setError("Please enter valid sensor values.");
      return;
    }

    // Check whether the voltage is within the selected battery's range
    const selectedBattery = batteries.find(
      (battery) => battery.batteryId === selectedBatteryId
    );

    if (selectedBattery) {
      if (
        volt < selectedBattery.minimumVoltage ||
        volt > selectedBattery.maximumVoltage
      ) {
        setError(
          `Invalid voltage! ${selectedBattery.batteryId} supports readings between ${selectedBattery.minimumVoltage} V and ${selectedBattery.maximumVoltage} V.`
        );
        return;
      }
    }

    // Prepare the reading data for the backend
    const readingData = {
      batteryId: selectedBatteryId,
      temperature: temp,
      voltage: volt,
      current: amps,
      coolantTemperature: coolant
    };

    try {
      // Send the sensor reading to Spring Boot
      const response = await api.post("/api/readings", readingData);

      // Store the response returned by the backend
      const savedReading = response.data;

      // Update the dashboard with the saved reading
      setReading({
        temperature: savedReading.temperature,
        voltage: savedReading.voltage,
        current: savedReading.current,
        coolantTemperature: coolant,
        risk: savedReading.riskLevel,
        time: new Date(savedReading.timestamp).toLocaleTimeString(),
        batteryId: savedReading.batteryId
      });

      // Refresh historical readings after successfully saving
      const historyResponse = await api.get(
        `/api/readings/battery/${selectedBatteryId}`
      );

      // Sort the latest readings first
      const updatedHistory = historyResponse.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setHistoricalReadings(updatedHistory);

      // Clear the sensor input fields after successful submission
      setTemperature("");
      setVoltage("");
      setCurrent("");
      setCoolantTemperature("");

    } catch (error) {
      console.error("Sensor reading submission error:", error);

      if (error.response) {
        if (error.response.status === 400) {
          setError(
            error.response.data.message ||
            "Invalid sensor reading. Please check the entered values."
          );
        } else {
          setError(
            "Something went wrong while processing your reading. Please try again."
          );
        }
      } else if (error.request) {
        setError(
          "Cannot connect to the backend. Check whether Spring Boot is running."
        );
      } else {
        setError("An unexpected error occurred: " + error.message);
      }
    }
  }

  // Prepare historical readings for the temperature trend chart
  const temperatureChartData = historicalReadings.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    temperature: item.temperature
  }));

  const selectedBattery = batteries.find(
    (battery) => battery.batteryId === selectedBatteryId
  );

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Login page */}
        <Route
        path="/login"
         element={<Login />}
        />

{/* Registration page */}
<Route
  path="/register"
  element={<Register />}
/>
          {/* Dashboard page */}
          <Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard reading={reading} />
    </ProtectedRoute>
  }
/>

          {/* Battery Management page */}
          <Route
            path="/batteries"
            element={
               <ProtectedRoute>
              <BatteryManagement
                batteryId={batteryId}
                setBatteryId={setBatteryId}
                batteryType={batteryType}
                setBatteryType={setBatteryType}
                nominalVoltage={nominalVoltage}
                setNominalVoltage={setNominalVoltage}
                minimumVoltage={minimumVoltage}
                setMinimumVoltage={setMinimumVoltage}
                maximumVoltage={maximumVoltage}
                setMaximumVoltage={setMaximumVoltage}
                warningTemperature={warningTemperature}
                setWarningTemperature={setWarningTemperature}
                criticalTemperature={criticalTemperature}
                setCriticalTemperature={setCriticalTemperature}
                handleBatterySubmit={handleBatterySubmit}
                batteries={batteries}
                batteryMessage={batteryMessage}
                batteryError={batteryError}
              />
              </ProtectedRoute>
            }
          />

          {/* Sensor Readings page */}
          <Route
            path="/readings/new"
            element={
              <ProtectedRoute>
              <SensorReadings
                selectedBatteryId={selectedBatteryId}
                setSelectedBatteryId={setSelectedBatteryId}
                batteries={batteries}
                temperature={temperature}
                setTemperature={setTemperature}
                voltage={voltage}
                setVoltage={setVoltage}
                current={current}
                setCurrent={setCurrent}
                coolantTemperature={coolantTemperature}
                setCoolantTemperature={setCoolantTemperature}
                handleSubmit={handleSubmit}
                error={error}
              />
              </ProtectedRoute>
            }
          />

          {/* Reading History page */}
          <Route
            path="/readings/history"
            element={
              <ProtectedRoute>
              <ReadingHistory
                historicalReadings={historicalReadings}
                historyLoading={historyLoading}
                historyError={historyError}
              />
              </ProtectedRoute>
            }
          />

          {/* Alerts page */}
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
              <Alerts
                historicalReadings={historicalReadings}
              />
              </ProtectedRoute>
            }
          />
        </Routes>

        <footer>
          EV Battery Thermal Monitoring Dashboard · Academic Prototype
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


// **********************Version2*********************************
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import Navbar from "./components/Navbar";
// import Dashboard from "./pages/Dashboard";
// import BatteryManagement from "./pages/BatteryManagement";
// import SensorReadings from "./pages/SensorReadings";
// import ReadingHistory from "./pages/ReadingHistory";
// import Alerts from "./pages/Alerts";
// import React, { useState, useEffect } from "react";
// import api from "./api";
// // import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceLine
// } from "recharts";
// import "./App.css";

// function App() {
//   // Store the battery selected for sensor monitoring
//   const [selectedBatteryId, setSelectedBatteryId] = useState("");

//   // Store the details entered while registering a battery
//   const [batteryId, setBatteryId] = useState("");
//   const [batteryType, setBatteryType] = useState("Lithium-ion");
//   const [nominalVoltage, setNominalVoltage] = useState("");
//   const [minimumVoltage, setMinimumVoltage] = useState("");
//   const [maximumVoltage, setMaximumVoltage] = useState("");
//   const [warningTemperature, setWarningTemperature] = useState("");
//   const [criticalTemperature, setCriticalTemperature] = useState("");

//   // Store batteries received from the Spring Boot backend
//   const [batteries, setBatteries] = useState([]);

//   // Store registration success and error messages
//   const [batteryMessage, setBatteryMessage] = useState("");
//   const [batteryError, setBatteryError] = useState("");

//   const [temperature, setTemperature] = useState("");
//   const [voltage, setVoltage] = useState("");
//   const [current, setCurrent] = useState("");
//   const [coolantTemperature, setCoolantTemperature] = useState("");
//   const [reading, setReading] = useState(null);
//   const [error, setError] = useState("");

//   // Store historical readings received from the backend
//   const [historicalReadings, setHistoricalReadings] = useState([]);

//   // Store the loading status while fetching historical readings
//   const [historyLoading, setHistoryLoading] = useState(false);

//   // Store errors related to historical readings
//   const [historyError, setHistoryError] = useState("");

//   // Load all registered batteries when the dashboard opens
//   useEffect(() => {
//     async function fetchBatteries() {
//       try {
//         const response = await axios.get(
//           api.get("/api/batteries")
//         );

//         // Store the batteries received from the backend
//         setBatteries(response.data);

//       } catch (error) {
//         console.error("Error loading batteries:", error);
//         setBatteryError(
//           "Unable to load registered batteries from the backend."
//         );
//       }
//     }

//     fetchBatteries();
//   }, []);

//   // Load historical readings whenever the selected battery changes
//   useEffect(() => {

//     // If no battery is selected, clear the historical readings
//     if (!selectedBatteryId) {
//       setHistoricalReadings([]);
//       setHistoryError("");
//       return;
//     }

//     async function fetchHistoricalReadings() {
//       try {
//         setHistoryLoading(true);
//         setHistoryError("");

//         // Request previous readings for the selected battery
//         const response = await axios.get(
//           	api.get(\/api/readings/battery/$`)`
//           // `http://localhost:8080/api/readings/battery/${selectedBatteryId}`
//         );

//         // Sort readings by timestamp, newest first
//         const sortedReadings = response.data.sort(
//           (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
//         );

//         setHistoricalReadings(sortedReadings);

//       } catch (error) {
//         console.error("Error loading historical readings:", error);

//         setHistoricalReadings([]);
//         setHistoryError(
//           "Unable to load historical readings from the backend."
//         );

//       } finally {
//         setHistoryLoading(false);
//       }
//     }

//     fetchHistoricalReadings();

//   }, [selectedBatteryId]);

//   // Send the new battery configuration to the Spring Boot backend
//   async function handleBatterySubmit(event) {
//     event.preventDefault();

//     // Clear previous messages
//     setBatteryMessage("");
//     setBatteryError("");

//     // Convert the voltage and temperature fields into numbers
//     const batteryData = {
//       batteryId: batteryId.trim(),
//       batteryType: batteryType.trim(),
//       nominalVoltage: Number(nominalVoltage),
//       minimumVoltage: Number(minimumVoltage),
//       maximumVoltage: Number(maximumVoltage),
//       warningTemperature: Number(warningTemperature),
//       criticalTemperature: Number(criticalTemperature)
//     };

//     // Check that all fields have been entered
//     if (
//       !batteryData.batteryId ||
//       !batteryData.batteryType ||
//       nominalVoltage === "" ||
//       minimumVoltage === "" ||
//       maximumVoltage === "" ||
//       warningTemperature === "" ||
//       criticalTemperature === ""
//     ) {
//       setBatteryError("Please fill in all battery configuration fields.");
//       return;
//     }

//     // Check that the entered values are valid numbers
//     const numericValues = [
//       batteryData.nominalVoltage,
//       batteryData.minimumVoltage,
//       batteryData.maximumVoltage,
//       batteryData.warningTemperature,
//       batteryData.criticalTemperature
//     ];

//     if (!numericValues.every(Number.isFinite)) {
//       setBatteryError("Please enter valid numeric values.");
//       return;
//     }

//     // Check that the voltage limits are in the correct order
//     if (
//       batteryData.minimumVoltage <= 0 ||
//       batteryData.minimumVoltage >= batteryData.nominalVoltage ||
//       batteryData.nominalVoltage >= batteryData.maximumVoltage
//     ) {
//       setBatteryError(
//         "Voltage limits must follow: minimum < nominal < maximum."
//       );
//       return;
//     }

//     // Critical temperature must be higher than warning temperature
//     if (
//       batteryData.warningTemperature <= 0 ||
//       batteryData.criticalTemperature <= batteryData.warningTemperature
//     ) {
//       setBatteryError(
//         "Critical temperature must be higher than warning temperature."
//       );
//       return;
//     }

//     try {
//       // Send the battery details to the Spring Boot REST API
//       const response = await axios.post(
//        api.post("/api/batteries", batteryData)
//       );

//       // Display a message after successful registration
//       setBatteryMessage(
//         `Battery ${response.data.batteryId} registered successfully!`
//       );

//       // Clear the form after successful registration
//       setBatteryId("");
//       setBatteryType("Lithium-ion");
//       setNominalVoltage("");
//       setMinimumVoltage("");
//       setMaximumVoltage("");
//       setWarningTemperature("");
//       setCriticalTemperature("");

//       // Add the newly registered battery to the displayed list
//       setBatteries((previousBatteries) => [
//         ...previousBatteries,
//         response.data
//       ]);

//     } catch (error) {
//       // Display the error returned by the backend
//       setBatteryError(
//         error.response?.data?.message ||
//         "Battery registration failed. Please check the backend."
//       );
//     }
//   }

//   // Submit battery sensor readings to the Spring Boot backend
//   async function handleSubmit(event) {
//     event.preventDefault();

//     setError("");

//     // Check whether a battery has been selected
//     if (!selectedBatteryId) {
//       setError("Please select a registered battery.");
//       return;
//     }

//     // Check whether all sensor fields are filled
//     if (
//       temperature === "" ||
//       voltage === "" ||
//       current === "" ||
//       coolantTemperature === ""
//     ) {
//       setError("Please fill in all sensor fields.");
//       return;
//     }

//     // Convert input values into numbers
//     const temp = Number(temperature);
//     const volt = Number(voltage);
//     const amps = Number(current);
//     const coolant = Number(coolantTemperature);

//     // Validate the sensor values
//     if (
//       ![temp, volt, amps, coolant].every(Number.isFinite) ||
//       temp < -40 || temp > 100 ||
//       volt <= 0 ||
//       amps < -1000 || amps > 1000 ||
//       coolant < -40 || coolant > 100
//     ) {
//       setError("Please enter valid sensor values.");
//       return;
//     }

//     // Check whether the voltage is within the selected battery's range
//     const selectedBattery = batteries.find(
//       (battery) => battery.batteryId === selectedBatteryId
//     );

//     if (selectedBattery) {
//       if (
//         volt < selectedBattery.minimumVoltage ||
//         volt > selectedBattery.maximumVoltage
//       ) {
//         setError(
//           `Invalid voltage! ${selectedBattery.batteryId} supports readings between ${selectedBattery.minimumVoltage} V and ${selectedBattery.maximumVoltage} V.`
//         );
//         return;
//       }
//     }

//     // Prepare the reading data for the backend
//     const readingData = {
//       batteryId: selectedBatteryId,
//       temperature: temp,
//       voltage: volt,
//       current: amps,
//       coolantTemperature: coolant
//     };

//     try {
//       // Send the sensor reading to Spring Boot
//       const response = await axios.post(
//        api.post("/api/readings", readingData)
//       );

//       // Store the response returned by the backend
//       const savedReading = response.data;

//       // Update the dashboard with the saved reading
//       setReading({
//         temperature: savedReading.temperature,
//         voltage: savedReading.voltage,
//         current: savedReading.current,
//         coolantTemperature: coolant,
//         risk: savedReading.riskLevel,
//         time: new Date(savedReading.timestamp).toLocaleTimeString(),
//         batteryId: savedReading.batteryId
//       });

//       // Refresh historical readings after successfully saving
//       const historyResponse = await axios.get(
//         `http://localhost:8080/api/readings/battery/${selectedBatteryId}`
//       );

//       // Sort the latest readings first
//       const updatedHistory = historyResponse.data.sort(
//         (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
//       );

//       setHistoricalReadings(updatedHistory);

//       // Clear the sensor input fields after successful submission
//       setTemperature("");
//       setVoltage("");
//       setCurrent("");
//       setCoolantTemperature("");

//     } catch (error) {
//       console.error("Sensor reading submission error:", error);

//       if (error.response) {
//         if (error.response.status === 400) {
//           setError(
//             error.response.data.message ||
//             "Invalid sensor reading. Please check the entered values."
//           );
//         } else {
//           setError(
//             "Something went wrong while processing your reading. Please try again."
//           );
//         }
//       } else if (error.request) {
//         setError(
//           "Cannot connect to the backend. Check whether Spring Boot is running."
//         );
//       } else {
//         setError("An unexpected error occurred: " + error.message);
//       }
//     }
//   }

//   // Prepare historical readings for the temperature trend chart
//   const temperatureChartData = historicalReadings.map((item) => ({
//     time: new Date(item.timestamp).toLocaleTimeString(),
//     temperature: item.temperature
//   }));

//   const selectedBattery = batteries.find(
//     (battery) => battery.batteryId === selectedBatteryId
//   );

//   return (
//      <AuthProvider>
//      <BrowserRouter>
//     <Navbar />

//     <Routes>
//       {/* Dashboard page */}
//       <Route
//         path="/"
//         element={<Dashboard reading={reading} />}
//       />

//       {/* Battery Management page */}
//       <Route
//         path="/batteries"
//         element={
//           <BatteryManagement
//             batteryId={batteryId}
//             setBatteryId={setBatteryId}
//             batteryType={batteryType}
//             setBatteryType={setBatteryType}
//             nominalVoltage={nominalVoltage}
//             setNominalVoltage={setNominalVoltage}
//             minimumVoltage={minimumVoltage}
//             setMinimumVoltage={setMinimumVoltage}
//             maximumVoltage={maximumVoltage}
//             setMaximumVoltage={setMaximumVoltage}
//             warningTemperature={warningTemperature}
//             setWarningTemperature={setWarningTemperature}
//             criticalTemperature={criticalTemperature}
//             setCriticalTemperature={setCriticalTemperature}
//             handleBatterySubmit={handleBatterySubmit}
//             batteries={batteries}
//             batteryMessage={batteryMessage}
//             batteryError={batteryError}
//           />
//         }
//       />

//       {/* Sensor Readings page */}
//       <Route
//         path="/readings/new"
//         element={
//           <SensorReadings
//             selectedBatteryId={selectedBatteryId}
//             setSelectedBatteryId={setSelectedBatteryId}
//             batteries={batteries}
//             temperature={temperature}
//             setTemperature={setTemperature}
//             voltage={voltage}
//             setVoltage={setVoltage}
//             current={current}
//             setCurrent={setCurrent}
//             coolantTemperature={coolantTemperature}
//             setCoolantTemperature={setCoolantTemperature}
//             handleSubmit={handleSubmit}
//             error={error}
//           />
//         }
//       />

//       {/* Reading History page */}
//       <Route
//         path="/readings/history"
//         element={
//           <ReadingHistory
//             historicalReadings={historicalReadings}
//             historyLoading={historyLoading}
//             historyError={historyError}
//           />
//         }
//       />

//       {/* Alerts page */}
//       <Route
//         path="/alerts"
//         element={
//           <Alerts
//             historicalReadings={historicalReadings}
//           />
//         }
//       />
//     </Routes>

//     <footer>
//       EV Battery Thermal Monitoring Dashboard · Academic Prototype
//     </footer>
//   </BrowserRouter>
//   </AuthProvider>



// **********************Version1***************************
    // <div className="dashboard">

    //   {/* Battery registration section */}
    //   <section className="panel">
    //     <h2>Register a New Battery</h2>

    //     <p>
    //       Enter the technical specifications of the battery before
    //       submitting its sensor readings.
    //     </p>

    //     <form className="sensor-form" onSubmit={handleBatterySubmit}>

    //       <label>
    //         Battery ID
    //         <input
    //           type="text"
    //           value={batteryId}
    //           onChange={(e) => setBatteryId(e.target.value)}
    //           placeholder="e.g. EV_BAT_002"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Battery Type
    //         <input
    //           type="text"
    //           value={batteryType}
    //           onChange={(e) => setBatteryType(e.target.value)}
    //           placeholder="e.g. Lithium-ion"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Nominal Voltage (V)
    //         <input
    //           type="number"
    //           step="any"
    //           value={nominalVoltage}
    //           onChange={(e) => setNominalVoltage(e.target.value)}
    //           placeholder="e.g. 400"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Minimum Voltage (V)
    //         <input
    //           type="number"
    //           step="any"
    //           value={minimumVoltage}
    //           onChange={(e) => setMinimumVoltage(e.target.value)}
    //           placeholder="e.g. 300"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Maximum Voltage (V)
    //         <input
    //           type="number"
    //           step="any"
    //           value={maximumVoltage}
    //           onChange={(e) => setMaximumVoltage(e.target.value)}
    //           placeholder="e.g. 450"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Warning Temperature (°C)
    //         <input
    //           type="number"
    //           step="any"
    //           value={warningTemperature}
    //           onChange={(e) => setWarningTemperature(e.target.value)}
    //           placeholder="e.g. 40"
    //           required
    //         />
    //       </label>

    //       <label>
    //         Critical Temperature (°C)
    //         <input
    //           type="number"
    //           step="any"
    //           value={criticalTemperature}
    //           onChange={(e) => setCriticalTemperature(e.target.value)}
    //           placeholder="e.g. 50"
    //           required
    //         />
    //       </label>

    //       <button type="submit">
    //         Register Battery
    //       </button>

    //     </form>

    //     {/* Show registration success or error */}
    //     {batteryMessage && (
    //       <p style={{ color: "green" }}>{batteryMessage}</p>
    //     )}

    //     {batteryError && (
    //       <p style={{ color: "red" }}>{batteryError}</p>
    //     )}
    //   </section>

    //   {/* Display batteries retrieved from the backend */}
    //   <section className="panel">
    //     <h2>Registered Batteries</h2>

    //     {batteries.length === 0 ? (
    //       <p>No batteries registered yet.</p>
    //     ) : (
    //       <div>
    //         {batteries.map((battery) => (
    //           <div
    //             key={battery.id}
    //             className="card"
    //             style={{ marginBottom: "15px" }}
    //           >
    //             <h3>{battery.batteryId}</h3>

    //             <p>Battery Type: {battery.batteryType}</p>

    //             <p>
    //               Nominal Voltage: {battery.nominalVoltage} V
    //             </p>

    //             <p>
    //               Voltage Range: {battery.minimumVoltage} V -
    //               {battery.maximumVoltage} V
    //             </p>

    //             <p>
    //               Warning Temperature: {battery.warningTemperature} °C
    //             </p>

    //             <p>
    //               Critical Temperature: {battery.criticalTemperature} °C
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </section>

    //   <header className="header">
    //     <div>
    //       <h1>EV Battery Thermal Monitoring</h1>
    //       <p>AI-Enabled Micro-channel Battery Thermal Management</p>
    //     </div>
    //     <span className="system-status">● Dashboard Active</span>
    //   </header>

    //   <section className="summary">
    //     <div className="card">
    //       <p>Battery Temperature</p>
    //       <h2>{reading ? `${reading.temperature} °C` : "-- °C"}</h2>
    //       <span>Latest submitted reading</span>
    //     </div>

    //     <div className="card">
    //       <p>Battery Voltage</p>
    //       <h2>{reading ? `${reading.voltage} V` : "-- V"}</h2>
    //       <span>Pack voltage</span>
    //     </div>

    //     <div className="card">
    //       <p>Current</p>
    //       <h2>{reading ? `${reading.current} A` : "-- A"}</h2>
    //       <span>Current reading</span>
    //     </div>

    //     <div className="card">
    //       <p>Thermal Risk</p>
    //       <h2>{reading ? reading.risk : "NO DATA"}</h2>
    //       <span>
    //         {reading
    //           ? "Calculated from submitted values"
    //           : "Submit a reading to begin"}
    //       </span>
    //     </div>
    //   </section>

    //   <section className="panel">
    //     <h2>Battery Sensor Reading</h2>

    //     <form className="sensor-form" onSubmit={handleSubmit}>

    //       {/* Select the registered battery */}
    //       <label>
    //         Select Battery
    //         <select
    //           value={selectedBatteryId}
    //           onChange={(e) => setSelectedBatteryId(e.target.value)}
    //           required
    //         >
    //           <option value="">-- Select a registered battery --</option>

    //           {batteries.map((battery) => (
    //             <option key={battery.id} value={battery.batteryId}>
    //               {battery.batteryId} - {battery.batteryType}
    //             </option>
    //           ))}
    //         </select>
    //       </label>

    //       {/* Enter battery temperature */}
    //       <label>
    //         Temperature (°C)
    //         <input
    //           type="number"
    //           step="any"
    //           value={temperature}
    //           onChange={(e) => setTemperature(e.target.value)}
    //           placeholder="e.g. 35"
    //           required
    //         />
    //       </label>

    //       {/* Enter battery voltage */}
    //       <label>
    //         Voltage (V)
    //         <input
    //           type="number"
    //           step="any"
    //           min="0"
    //           value={voltage}
    //           onChange={(e) => setVoltage(e.target.value)}
    //           placeholder="e.g. 380"
    //           required
    //         />
    //       </label>

    //       {/* Enter battery current */}
    //       <label>
    //         Current (A)
            
    //         <input
    //       type="number"
    //       step="any"
    //       // min="0"
    //       max="1000"
    //       value={current}
    //       onChange={(e) => setCurrent(e.target.value)}
    //       placeholder="e.g. 45"
    //       required
    //       />
    //       </label>

    //       {/* Enter coolant temperature */}
    //       <label>
    //         Coolant Temperature (°C)
    //         <input
    //           type="number"
    //           step="any"
    //           value={coolantTemperature}
    //           onChange={(e) => setCoolantTemperature(e.target.value)}
    //           placeholder="e.g. 31"
    //           required
    //         />
    //       </label>

    //       <button type="submit">Analyze Reading</button>

    //     </form>

    //     {error && <p style={{ color: "red" }}>{error}</p>}
    //   </section>

    //   <section className="panel">
    //     <h2>Latest Analysis</h2>

    //     {!reading ? (
    //       <p>Submit a sensor reading to see the thermal analysis.</p>
    //     ) : (
    //       <>
    //         <p>Recorded at: {reading.time}</p>

    //         <p>
    //           Coolant temperature: {reading.coolantTemperature} °C
    //         </p>

    //         <p>
    //           Risk result: <strong>{reading.risk}</strong>
    //         </p>

    //         <p>
    //           {reading.risk === "CRITICAL"
    //             ? "Critical temperature detected. Stop the test safely and inspect the cooling system."
    //             : reading.risk === "WARNING"
    //             ? "Elevated thermal risk. Check coolant temperature and cooling circulation."
    //             : "Temperature is within this prototype's configured normal range."}
    //         </p>
    //       </>
    //     )}
    //   </section>

    //   {/* Display historical sensor readings */}
    //   <section className="panel">
    //     <h2>Historical Battery Readings</h2>

    //     {!selectedBatteryId ? (
    //       <p>Please select a battery to view its historical readings.</p>
    //     ) : historyLoading ? (
    //       <p>Loading historical readings...</p>
    //     ) : historyError ? (
    //       <p style={{ color: "red" }}>{historyError}</p>
    //     ) : historicalReadings.length === 0 ? (
    //       <p>No historical readings available for this battery.</p>
    //     ) : (
    //       <>
    //         <p>
    //           Showing previous readings for: <strong>{selectedBatteryId}</strong>
    //         </p>

    //         <div style={{ overflowX: "auto" }}>
    //           <table style={{
    //             width: "100%",
    //             borderCollapse: "collapse",
    //             textAlign: "center"
    //           }}>
    //             <thead>
    //               <tr>
    //                 <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
    //                   Temperature (°C)
    //                 </th>
    //                 <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
    //                   Voltage (V)
    //                 </th>
    //                 <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
    //                   Current (A)
    //                 </th>
    //                 <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
    //                   Risk Level
    //                 </th>
    //                 <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
    //                   Date and Time
    //                 </th>
    //               </tr>
    //             </thead>

    //             <tbody>
    //               {historicalReadings.map((item) => (
    //                 <tr key={item.id}>
    //                   <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
    //                     {item.temperature}
    //                   </td>

    //                   <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
    //                     {item.voltage}
    //                   </td>

    //                   <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
    //                     {item.current}
    //                   </td>

    //                   <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
    //                     <strong>{item.riskLevel}</strong>
    //                   </td>

    //                   <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
    //                     {new Date(item.timestamp).toLocaleString()}
    //                   </td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       </>
    //     )}
    //   </section>

    //   {/* Battery temperature trend chart */}
    //   <section className="panel">
    //     <h2>Battery Temperature Trend</h2>

    //     {!selectedBatteryId ? (
    //       <p>Please select a battery to view its temperature trend.</p>
    //     ) : historicalReadings.length === 0 ? (
    //       <p>No historical temperature data available.</p>
    //     ) : (
    //       <>
    //         <p>
    //           Temperature variation for: <strong>{selectedBatteryId}</strong>
    //         </p>

    //         <ResponsiveContainer width="100%" height={350}>
    //           <LineChart
    //             data={[...temperatureChartData].reverse()}
    //             margin={{
    //               top: 20,
    //               right: 30,
    //               left: 10,
    //               bottom: 45
    //             }}
    //           >
    //             <CartesianGrid strokeDasharray="3 3" />

    //             <XAxis
    //               dataKey="time"
    //               tick={{ fontSize: 12 }}
    //               height={35}
    //             />

    //             <YAxis
    //               label={{
    //                 value: "Temperature (°C)",
    //                 angle: -90,
    //                 position: "insideLeft"
    //               }}
    //             />

    //             <Tooltip />

    //             <Legend
    //               wrapperStyle={{ paddingTop: "15px" }}
    //             />

    //             {selectedBattery && (
    //               <>
    //                 <ReferenceLine
    //                   y={selectedBattery.warningTemperature}
    //                   stroke="orange"
    //                   strokeDasharray="5 5"
    //                   label="Warning"
    //                 />

    //                 <ReferenceLine
    //                   y={selectedBattery.criticalTemperature}
    //                   stroke="red"
    //                   strokeDasharray="5 5"
    //                   label="Critical"
    //                 />
    //               </>
    //             )}

    //             <Line
    //               type="monotone"
    //               dataKey="temperature"
    //               name="Battery Temperature"
    //               stroke="#2563eb"
    //               strokeWidth={3}
    //               dot={{ r: 5 }}
    //               activeDot={{ r: 7 }}
    //             />
    //           </LineChart>
    //         </ResponsiveContainer>

    //         <p
    //           style={{
    //             textAlign: "center",
    //             marginTop: "5px",
    //             marginBottom: "0",
    //             fontSize: "14px"
    //           }}
    //         >
    //           Recording Time
    //         </p>
    //       </>
    //     )}
    //   </section>

    //   <footer>
    //     EV Battery Thermal Monitoring Dashboard · Academic Prototype
    //   </footer>
    // </div>
  // );
// }

// export default App;





// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceLine
// } from "recharts";
// import "./App.css";

// function App() {
//     // Store the details entered while registering a battery
//       // Store the battery selected for sensor monitoring
//   const [selectedBatteryId, setSelectedBatteryId] = useState("");
//   const [batteryId, setBatteryId] = useState("");
//   const [batteryType, setBatteryType] = useState("Lithium-ion");
//   const [nominalVoltage, setNominalVoltage] = useState("");
//   const [minimumVoltage, setMinimumVoltage] = useState("");
//   const [maximumVoltage, setMaximumVoltage] = useState("");
//   const [warningTemperature, setWarningTemperature] = useState("");
//   const [criticalTemperature, setCriticalTemperature] = useState("");

//   // Store batteries received from the Spring Boot backend
//   const [batteries, setBatteries] = useState([]);

//   // Store registration success and error messages
//   const [batteryMessage, setBatteryMessage] = useState("");
//   const [batteryError, setBatteryError] = useState("");
//   const [temperature, setTemperature] = useState("");
//   const [voltage, setVoltage] = useState("");
//   const [current, setCurrent] = useState("");
//   const [coolantTemperature, setCoolantTemperature] = useState("");
//   const [reading, setReading] = useState(null);
//   const [error, setError] = useState("");
// // Store historical readings received from the backend
// const [historicalReadings, setHistoricalReadings] = useState([]);

// // Store the loading status while fetching historical readings
// const [historyLoading, setHistoryLoading] = useState(false);

// // Store errors related to historical readings
// const [historyError, setHistoryError] = useState("");


//     // Load all registered batteries when the dashboard opens
//   useEffect(() => {
//     async function fetchBatteries() {
//       try {
//         const response = await axios.get(
//           "http://localhost:8080/api/batteries"
//         );

//         // Store the batteries received from the backend
//         setBatteries(response.data);

//       } catch (error) {
//         console.error("Error loading batteries:", error);
//         setBatteryError(
//           "Unable to load registered batteries from the backend."
//         );
//       }
//     }

//     fetchBatteries();
//   }, []);


//   // Load historical readings whenever the selected battery changes
// useEffect(() => {

//   // If no battery is selected, clear the historical readings
//   if (!selectedBatteryId) {
//     setHistoricalReadings([]);
//     setHistoryError("");
//     return;
//   }

//   async function fetchHistoricalReadings() {
//     try {
//       setHistoryLoading(true);
//       setHistoryError("");

//       // Request previous readings for the selected battery
//       const response = await axios.get(
//         `http://localhost:8080/api/readings/battery/${selectedBatteryId}`
//       );

//       // Sort readings by timestamp, newest first
//       const sortedReadings = response.data.sort(
//         (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
//       );

//       setHistoricalReadings(sortedReadings);

//     } catch (error) {
//       console.error("Error loading historical readings:", error);

//       setHistoricalReadings([]);
//       setHistoryError(
//         "Unable to load historical readings from the backend."
//       );

//     } finally {
//       setHistoryLoading(false);
//     }
//   }

//   fetchHistoricalReadings();

// }, [selectedBatteryId]);

//     // Send the new battery configuration to the Spring Boot backend
//   async function handleBatterySubmit(event) {
//     event.preventDefault();

//     // Clear previous messages
//     setBatteryMessage("");
//     setBatteryError("");

//     // Convert the voltage and temperature fields into numbers
//     const batteryData = {
//       batteryId: batteryId.trim(),
//       batteryType: batteryType.trim(),
//       nominalVoltage: Number(nominalVoltage),
//       minimumVoltage: Number(minimumVoltage),
//       maximumVoltage: Number(maximumVoltage),
//       warningTemperature: Number(warningTemperature),
//       criticalTemperature: Number(criticalTemperature)
//     };

//     // Check that all fields have been entered
//     if (
//       !batteryData.batteryId ||
//       !batteryData.batteryType ||
//       nominalVoltage === "" ||
//       minimumVoltage === "" ||
//       maximumVoltage === "" ||
//       warningTemperature === "" ||
//       criticalTemperature === ""
//     ) {
//       setBatteryError("Please fill in all battery configuration fields.");
//       return;
//     }

//     // Check that the entered values are valid numbers
//     const numericValues = [
//       batteryData.nominalVoltage,
//       batteryData.minimumVoltage,
//       batteryData.maximumVoltage,
//       batteryData.warningTemperature,
//       batteryData.criticalTemperature
//     ];

//     if (!numericValues.every(Number.isFinite)) {
//       setBatteryError("Please enter valid numeric values.");
//       return;
//     }

//     // Check that the voltage limits are in the correct order
//     if (
//       batteryData.minimumVoltage <= 0 ||
//       batteryData.minimumVoltage >= batteryData.nominalVoltage ||
//       batteryData.nominalVoltage >= batteryData.maximumVoltage
//     ) {
//       setBatteryError(
//         "Voltage limits must follow: minimum < nominal < maximum."
//       );
//       return;
//     }

//     // Critical temperature must be higher than warning temperature
//     if (
//       batteryData.warningTemperature <= 0 ||
//       batteryData.criticalTemperature <= batteryData.warningTemperature
//     ) {
//       setBatteryError(
//         "Critical temperature must be higher than warning temperature."
//       );
//       return;
//     }

//     try {
//       // Send the battery details to the Spring Boot REST API
//       const response = await axios.post(
//         "http://localhost:8080/api/batteries",
//         batteryData
//       );

//       // Display a message after successful registration
//       setBatteryMessage(
//         `Battery ${response.data.batteryId} registered successfully!`
//       );

//       // Clear the form after successful registration
//       setBatteryId("");
//       setBatteryType("Lithium-ion");
//       setNominalVoltage("");
//       setMinimumVoltage("");
//       setMaximumVoltage("");
//       setWarningTemperature("");
//       setCriticalTemperature("");

//       // Add the newly registered battery to the displayed list
//       setBatteries((previousBatteries) => [
//         ...previousBatteries,
//         response.data
//       ]);

//     } catch (error) {
//       // Display the error returned by the backend
//       setBatteryError(
//         error.response?.data?.message ||
//         "Battery registration failed. Please check the backend."
//       );
//     }
//   }

//   // Submit battery sensor readings to the Spring Boot backend
//   async function handleSubmit(event) {
//     event.preventDefault();

//     setError("");

//     // Check whether a battery has been selected
//     if (!selectedBatteryId) {
//       setError("Please select a registered battery.");
//       return;
//     }

//     // Check whether all sensor fields are filled
//     if (
//       temperature === "" ||
//       voltage === "" ||
//       current === "" ||
//       coolantTemperature === ""
//     ) {
//       setError("Please fill in all sensor fields.");
//       return;
//     }

//     // Convert input values into numbers
//     const temp = Number(temperature);
//     const volt = Number(voltage);
//     const amps = Number(current);
//     const coolant = Number(coolantTemperature);

//     // Validate the sensor values
//     if (
//       ![temp, volt, amps, coolant].every(Number.isFinite) ||
//       temp < -40 || temp > 100 ||
//       volt <= 0 ||
//       amps < -1000 || amps > 1000 ||
//       coolant < -40 || coolant > 100
//     ) {
//       setError("Please enter valid sensor values.");
//       return;
//     }

//     // Prepare the reading data for the backend
//     const readingData = {
//       batteryId: selectedBatteryId,
//       temperature: temp,
//       voltage: volt,
//       current: amps
//     };

    
//     try {
//       // Send the sensor reading to Spring Boot
//       const response = await axios.post(
//         "http://localhost:8080/api/readings",
//         readingData
//       );

//       // Store the response returned by the backend
//       const savedReading = response.data;

//       // Update the dashboard with the saved reading
//       setReading({
//         temperature: savedReading.temperature,
//         voltage: savedReading.voltage,
//         current: savedReading.current,
//         coolantTemperature: coolant,
//         risk: savedReading.riskLevel,
//         time: new Date(savedReading.timestamp).toLocaleTimeString(),
//         batteryId: savedReading.batteryId
//       });

//       // Refresh historical readings after successfully saving
//       const historyResponse = await axios.get(
//         `http://localhost:8080/api/readings/battery/${selectedBatteryId}`
//       );

//       // Sort the latest readings first
//       const updatedHistory = historyResponse.data.sort(
//         (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
//       );

//       setHistoricalReadings(updatedHistory);

//       // Clear the sensor input fields after successful submission
//       setTemperature("");
//       setVoltage("");
//       setCurrent("");
//       setCoolantTemperature("");

//     } catch (error) {
//       console.error("Sensor reading submission error:", error);

//       if (error.response) {
//         if (error.response.status === 400) {
//           setError(
//             error.response.data.message ||
//             "Invalid sensor reading. Please check the entered values."
//           );
//         } else {
//           setError(
//             "Something went wrong while processing your reading. Please try again."
//           );
//         }
//       } else if (error.request) {
//         setError(
//           "Cannot connect to the backend. Check whether Spring Boot is running."
//         );
//       } else {
//         setError("An unexpected error occurred: " + error.message);
//       }
//     }
//   }


 

//   // Prepare historical readings for the temperature trend chart
// const temperatureChartData = historicalReadings.map((item) => ({
//   time: new Date(item.timestamp).toLocaleTimeString(),
//   temperature: item.temperature
// }));


// const selectedBattery = batteries.find(
//   (battery) => battery.batteryId === selectedBatteryId
// );

//   return (
//     <div className="dashboard">
//           {/* Battery registration section */}
//       <section className="panel">
//         <h2>Register a New Battery</h2>

//         <p>
//           Enter the technical specifications of the battery before
//           submitting its sensor readings.
//         </p>

//         <form className="sensor-form" onSubmit={handleBatterySubmit}>
//                     {/* <label>
//             Select Battery

//             <select
//               value={selectedBatteryId}
//               onChange={(e) => setSelectedBatteryId(e.target.value)}
//               required
//             >
//               <option value="">-- Select a registered battery --</option>

//               {batteries.map((battery) => (
//                 <option key={battery.id} value={battery.batteryId}>
//                   {battery.batteryId} - {battery.batteryType}
//                 </option>
//               ))}
//             </select>
//           </label> */}

//           <label>
//             Battery ID
//             <input
//               type="text"
//               value={batteryId}
//               onChange={(e) => setBatteryId(e.target.value)}
//               placeholder="e.g. EV_BAT_002"
//               required
//             />
//           </label>

//           <label>
//             Battery Type
//             <input
//               type="text"
//               value={batteryType}
//               onChange={(e) => setBatteryType(e.target.value)}
//               placeholder="e.g. Lithium-ion"
//               required
//             />
//           </label>

//           <label>
//             Nominal Voltage (V)
//             <input
//               type="number"
//               step="any"
//               value={nominalVoltage}
//               onChange={(e) => setNominalVoltage(e.target.value)}
//               placeholder="e.g. 400"
//               required
//             />
//           </label>

//           <label>
//             Minimum Voltage (V)
//             <input
//               type="number"
//               step="any"
//               value={minimumVoltage}
//               onChange={(e) => setMinimumVoltage(e.target.value)}
//               placeholder="e.g. 300"
//               required
//             />
//           </label>

//           <label>
//             Maximum Voltage (V)
//             <input
//               type="number"
//               step="any"
//               value={maximumVoltage}
//               onChange={(e) => setMaximumVoltage(e.target.value)}
//               placeholder="e.g. 450"
//               required
//             />
//           </label>

//           <label>
//             Warning Temperature (°C)
//             <input
//               type="number"
//               step="any"
//               value={warningTemperature}
//               onChange={(e) => setWarningTemperature(e.target.value)}
//               placeholder="e.g. 40"
//               required
//             />
//           </label>

//           <label>
//             Critical Temperature (°C)
//             <input
//               type="number"
//               step="any"
//               value={criticalTemperature}
//               onChange={(e) => setCriticalTemperature(e.target.value)}
//               placeholder="e.g. 50"
//               required
//             />
//           </label>

//           <button type="submit">
//             Register Battery
//           </button>

//         </form>

//         {/* Show registration success or error */}
//         {batteryMessage && (
//           <p style={{ color: "green" }}>{batteryMessage}</p>
//         )}

//         {batteryError && (
//           <p style={{ color: "red" }}>{batteryError}</p>
//         )}
//       </section>

//             {/* Display batteries retrieved from the backend */}
//       <section className="panel">
//         <h2>Registered Batteries</h2>

//         {batteries.length === 0 ? (
//           <p>No batteries registered yet.</p>
//         ) : (
//           <div>
//             {batteries.map((battery) => (
//               <div
//                 key={battery.id}
//                 className="card"
//                 style={{ marginBottom: "15px" }}
//               >
//                 <h3>{battery.batteryId}</h3>

//                 <p>Battery Type: {battery.batteryType}</p>

//                 <p>
//                   Nominal Voltage: {battery.nominalVoltage} V
//                 </p>

//                 <p>
//                   Voltage Range: {battery.minimumVoltage} V -
//                   {battery.maximumVoltage} V
//                 </p>

//                 <p>
//                   Warning Temperature: {battery.warningTemperature} °C
//                 </p>

//                 <p>
//                   Critical Temperature: {battery.criticalTemperature} °C
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>









//       <header className="header">
//         <div>
//           <h1>EV Battery Thermal Monitoring</h1>
//           <p>AI-Enabled Micro-channel Battery Thermal Management</p>
//         </div>
//         <span className="system-status">● Dashboard Active</span>
//       </header>

//       <section className="summary">
//         <div className="card">
//           <p>Battery Temperature</p>
//           <h2>{reading ? `${reading.temperature} °C` : "-- °C"}</h2>
//           <span>Latest submitted reading</span>
//         </div>

//         <div className="card">
//           <p>Battery Voltage</p>
//           <h2>{reading ? `${reading.voltage} V` : "-- V"}</h2>
//           <span>Pack voltage</span>
//         </div>

//         <div className="card">
//           <p>Current</p>
//           <h2>{reading ? `${reading.current} A` : "-- A"}</h2>
//           <span>Current reading</span>
//         </div>

//         <div className="card">
//           <p>Thermal Risk</p>
//           <h2>{reading ? reading.risk : "NO DATA"}</h2>
//           <span>{reading ? "Calculated from submitted values" : "Submit a reading to begin"}</span>
//         </div>
//       </section>

//       <section className="panel">
//         <h2>Battery Sensor Reading</h2>
//                 <form className="sensor-form" onSubmit={handleSubmit}>

//           {/* Select the registered battery */}
//           <label>
//             Select Battery
//             <select
//               value={selectedBatteryId}
//               onChange={(e) => setSelectedBatteryId(e.target.value)}
//               required
//             >
//               <option value="">-- Select a registered battery --</option>

//               {batteries.map((battery) => (
//                 <option key={battery.id} value={battery.batteryId}>
//                   {battery.batteryId} - {battery.batteryType}
//                 </option>
//               ))}
//             </select>
//           </label>

//           {/* Enter battery temperature */}
//           <label>
//             Temperature (°C)
//             <input
//               type="number"
//               step="any"
//               value={temperature}
//               onChange={(e) => setTemperature(e.target.value)}
//               placeholder="e.g. 35"
//               required
//             />
//           </label>

//           {/* Enter battery voltage */}
//           <label>
//             Voltage (V)
//             <input
//               type="number"
//               step="any"
//               min="0"
//               value={voltage}
//               onChange={(e) => setVoltage(e.target.value)}
//               placeholder="e.g. 380"
//               required
//             />
//           </label>

//           {/* Enter battery current */}
//           <label>
//             Current (A)
//             <input
//               type="number"
//               step="any"
//               value={current}
//               onChange={(e) => setCurrent(e.target.value)}
//               placeholder="e.g. 45"
//               required
//             />
//           </label>

//           {/* Enter coolant temperature */}
//           <label>
//             Coolant Temperature (°C)
//             <input
//               type="number"
//               step="any"
//               value={coolantTemperature}
//               onChange={(e) => setCoolantTemperature(e.target.value)}
//               placeholder="e.g. 31"
//               required
//             />
//           </label>

//           <button type="submit">Analyze Reading</button>

//         </form>

//         {error && <p style={{ color: "red" }}>{error}</p>}
//       </section>

//       <section className="panel">
//         <h2>Latest Analysis</h2>

//         {!reading ? (
//           <p>Submit a sensor reading to see the thermal analysis.</p>
//         ) : (
//           <>
//             <p>Recorded at: {reading.time}</p>
//             <p>
//               Coolant temperature: {reading.coolantTemperature} °C
//             </p>
//             <p>
//               Risk result: <strong>{reading.risk}</strong>
//             </p>
//             <p>
//               {reading.risk === "CRITICAL"
//                 ? "Critical temperature detected. Stop the test safely and inspect the cooling system."
//                 : reading.risk === "WARNING"
//                 ? "Elevated thermal risk. Check coolant temperature and cooling circulation."
//                 : "Temperature is within this prototype's configured normal range."}
//             </p>
//           </>
//         )}
//       </section>

// {/* Display historical sensor readings */}
// <section className="panel">
//   <h2>Historical Battery Readings</h2>

//   {!selectedBatteryId ? (
//     <p>Please select a battery to view its historical readings.</p>
//   ) : historyLoading ? (
//     <p>Loading historical readings...</p>
//   ) : historyError ? (
//     <p style={{ color: "red" }}>{historyError}</p>
//   ) : historicalReadings.length === 0 ? (
//     <p>No historical readings available for this battery.</p>
//   ) : (
//     <>
//       <p>
//         Showing previous readings for: <strong>{selectedBatteryId}</strong>
//       </p>

//       <div style={{ overflowX: "auto" }}>
//         <table style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           textAlign: "center"
//         }}>
//           <thead>
//             <tr>
//               <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                 Temperature (°C)
//               </th>
//               <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                 Voltage (V)
//               </th>
//               <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                 Current (A)
//               </th>
//               <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                 Risk Level
//               </th>
//               <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                 Date and Time
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {historicalReadings.map((item) => (
//               <tr key={item.id}>
//                 <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
//                   {item.temperature}
//                 </td>

//                 <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
//                   {item.voltage}
//                 </td>

//                 <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
//                   {item.current}
//                 </td>

//                 <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
//                   <strong>{item.riskLevel}</strong>
//                 </td>

//                 <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
//                   {new Date(item.timestamp).toLocaleString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </>
//   )}
// </section>
// {/* Battery temperature trend chart */}
// <section className="panel">
//   <h2>Battery Temperature Trend</h2>

//   {!selectedBatteryId ? (
//     <p>Please select a battery to view its temperature trend.</p>
//   ) : historicalReadings.length === 0 ? (
//     <p>No historical temperature data available.</p>
//   ) : (
//     <>
//       <p>
//         Temperature variation for: <strong>{selectedBatteryId}</strong>
//       </p>

//       <ResponsiveContainer width="100%" height={350}>
//         <LineChart
//           data={[...temperatureChartData].reverse()}
//           margin={{
//           top: 20,
//           right: 30,
//           left: 10,
//           bottom: 45
//         }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />

//           <XAxis
//         dataKey="time"
//         tick={{ fontSize: 12 }}
//          height={35}
//         />

//           <YAxis
//             label={{
//               value: "Temperature (°C)",
//               angle: -90,
//               position: "insideLeft"
//             }}
//           />

//           <Tooltip />
//           <Legend
//            wrapperStyle={{ paddingTop: "15px" }}
//           />

//           {selectedBattery && (
//   <>
//     <ReferenceLine
//       y={selectedBattery.warningTemperature}
//       stroke="orange"
//       strokeDasharray="5 5"
//       label="Warning"
//     />

//     <ReferenceLine
//       y={selectedBattery.criticalTemperature}
//       stroke="red"
//       strokeDasharray="5 5"
//       label="Critical"
//     />
//   </>
// )}

//           <Line
//             type="monotone"
//             dataKey="temperature"
//             name="Battery Temperature"
//             stroke="#2563eb"
//             strokeWidth={3}
//             dot={{ r: 5 }}
//             activeDot={{ r: 7 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//       <p
//   style={{
//     textAlign: "center",
//     marginTop: "5px",
//     marginBottom: "0",
//     fontSize: "14px"
//   }}
// >
//   Recording Time
// </p>
//     </>
//   )}
// </section>

//       <footer>
//         EV Battery Thermal Monitoring Dashboard · Academic Prototype
//       </footer>
//     </div>
//   );
// }

// export default App;






// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import "./App.css";

// // function App() {
// //     // Store the details entered while registering a battery
// //       // Store the battery selected for sensor monitoring
// //   const [selectedBatteryId, setSelectedBatteryId] = useState("");
// //   const [batteryId, setBatteryId] = useState("");
// //   const [batteryType, setBatteryType] = useState("Lithium-ion");
// //   const [nominalVoltage, setNominalVoltage] = useState("");
// //   const [minimumVoltage, setMinimumVoltage] = useState("");
// //   const [maximumVoltage, setMaximumVoltage] = useState("");
// //   const [warningTemperature, setWarningTemperature] = useState("");
// //   const [criticalTemperature, setCriticalTemperature] = useState("");

// //   // Store batteries received from the Spring Boot backend
// //   const [batteries, setBatteries] = useState([]);

// //   // Store registration success and error messages
// //   const [batteryMessage, setBatteryMessage] = useState("");
// //   const [batteryError, setBatteryError] = useState("");
// //   const [temperature, setTemperature] = useState("");
// //   const [voltage, setVoltage] = useState("");
// //   const [current, setCurrent] = useState("");
// //   const [coolantTemperature, setCoolantTemperature] = useState("");
// //   const [reading, setReading] = useState(null);
// //   const [error, setError] = useState("");



// //     // Load all registered batteries when the dashboard opens
// //   useEffect(() => {
// //     async function fetchBatteries() {
// //       try {
// //         const response = await axios.get(
// //           "http://localhost:8080/api/batteries"
// //         );

// //         // Store the batteries received from the backend
// //         setBatteries(response.data);

// //       } catch (error) {
// //         console.error("Error loading batteries:", error);
// //         setBatteryError(
// //           "Unable to load registered batteries from the backend."
// //         );
// //       }
// //     }

// //     fetchBatteries();
// //   }, []);

// //     // Send the new battery configuration to the Spring Boot backend
// //   async function handleBatterySubmit(event) {
// //     event.preventDefault();

// //     // Clear previous messages
// //     setBatteryMessage("");
// //     setBatteryError("");

// //     // Convert the voltage and temperature fields into numbers
// //     const batteryData = {
// //       batteryId: batteryId.trim(),
// //       batteryType: batteryType.trim(),
// //       nominalVoltage: Number(nominalVoltage),
// //       minimumVoltage: Number(minimumVoltage),
// //       maximumVoltage: Number(maximumVoltage),
// //       warningTemperature: Number(warningTemperature),
// //       criticalTemperature: Number(criticalTemperature)
// //     };

// //     // Check that all fields have been entered
// //     if (
// //       !batteryData.batteryId ||
// //       !batteryData.batteryType ||
// //       nominalVoltage === "" ||
// //       minimumVoltage === "" ||
// //       maximumVoltage === "" ||
// //       warningTemperature === "" ||
// //       criticalTemperature === ""
// //     ) {
// //       setBatteryError("Please fill in all battery configuration fields.");
// //       return;
// //     }

// //     // Check that the entered values are valid numbers
// //     const numericValues = [
// //       batteryData.nominalVoltage,
// //       batteryData.minimumVoltage,
// //       batteryData.maximumVoltage,
// //       batteryData.warningTemperature,
// //       batteryData.criticalTemperature
// //     ];

// //     if (!numericValues.every(Number.isFinite)) {
// //       setBatteryError("Please enter valid numeric values.");
// //       return;
// //     }

// //     // Check that the voltage limits are in the correct order
// //     if (
// //       batteryData.minimumVoltage <= 0 ||
// //       batteryData.minimumVoltage >= batteryData.nominalVoltage ||
// //       batteryData.nominalVoltage >= batteryData.maximumVoltage
// //     ) {
// //       setBatteryError(
// //         "Voltage limits must follow: minimum < nominal < maximum."
// //       );
// //       return;
// //     }

// //     // Critical temperature must be higher than warning temperature
// //     if (
// //       batteryData.warningTemperature <= 0 ||
// //       batteryData.criticalTemperature <= batteryData.warningTemperature
// //     ) {
// //       setBatteryError(
// //         "Critical temperature must be higher than warning temperature."
// //       );
// //       return;
// //     }

// //     try {
// //       // Send the battery details to the Spring Boot REST API
// //       const response = await axios.post(
// //         "http://localhost:8080/api/batteries",
// //         batteryData
// //       );

// //       // Display a message after successful registration
// //       setBatteryMessage(
// //         `Battery ${response.data.batteryId} registered successfully!`
// //       );

// //       // Clear the form after successful registration
// //       setBatteryId("");
// //       setBatteryType("Lithium-ion");
// //       setNominalVoltage("");
// //       setMinimumVoltage("");
// //       setMaximumVoltage("");
// //       setWarningTemperature("");
// //       setCriticalTemperature("");

// //       // Add the newly registered battery to the displayed list
// //       setBatteries((previousBatteries) => [
// //         ...previousBatteries,
// //         response.data
// //       ]);

// //     } catch (error) {
// //       // Display the error returned by the backend
// //       setBatteryError(
// //         error.response?.data?.message ||
// //         "Battery registration failed. Please check the backend."
// //       );
// //     }
// //   }


// //   function handleSubmit(event) {
// //     // event.preventDefault();
// //     // setError("");

// //     // if (
// //     //   temperature === "" ||
// //     //   voltage === "" ||
// //     //   current === "" ||
// //     //   coolantTemperature === ""
// //     // ) {
// //     //   setError("Please fill in all fields.");
// //     //   return;
// //     // }

// //     // const temp = Number(temperature);
// //     // const volt = Number(voltage);
// //     // const amps = Number(current);
// //     // const coolant = Number(coolantTemperature);

// //     // if (
// //     //   ![temp, volt, amps, coolant].every(Number.isFinite) ||
// //     //   temp < -50 || temp > 150 ||
// //     //   volt < 0 || amps < 0 ||
// //     //   coolant < -50 || coolant > 150
// //     // ) {
// //     //   setError("Enter valid sensor values.");
// //     //   return;
// //     // }

// //     // let risk = "NORMAL";

// //     // if (temp >= 50) {
// //     //   risk = "CRITICAL";
// //     // } else if (temp >= 40) {
// //     //   risk = "WARNING";
// //     // }

// //     // if (coolant >= 40 && risk === "NORMAL") {
// //     //   risk = "WARNING";
// //     // }

// //     // setReading({
// //     //   temperature: temp,
// //     //   voltage: volt,
// //     //   current: amps,
// //     //   coolantTemperature: coolant,
// //     //   risk,
// //     //   time: new Date().toLocaleTimeString()
// //     // });
// //       // Submit battery sensor readings to the Spring Boot backend
// //   async function handleSubmit(event) {
// //     event.preventDefault();

// //     setError("");

// //     // Check whether a battery has been selected
// //     if (!selectedBatteryId) {
// //       setError("Please select a registered battery.");
// //       return;
// //     }

// //     // Check whether all sensor fields are filled
// //     if (
// //       temperature === "" ||
// //       voltage === "" ||
// //       current === "" ||
// //       coolantTemperature === ""
// //     ) {
// //       setError("Please fill in all sensor fields.");
// //       return;
// //     }

// //     // Convert input values into numbers
// //     const temp = Number(temperature);
// //     const volt = Number(voltage);
// //     const amps = Number(current);
// //     const coolant = Number(coolantTemperature);

// //     // Validate the sensor values
// //     if (
// //       ![temp, volt, amps, coolant].every(Number.isFinite) ||
// //       temp < -40 || temp > 100 ||
// //       volt <= 0 ||
// //       amps < -1000 || amps > 1000 ||
// //       coolant < -40 || coolant > 100
// //     ) {
// //       setError("Please enter valid sensor values.");
// //       return;
// //     }

// //     // Prepare the reading data for the backend
// //     const readingData = {
// //       batteryId: selectedBatteryId,
// //       temperature: temp,
// //       voltage: volt,
// //       current: amps
// //     };

// //     try {
// //       // Send the sensor reading to Spring Boot
// //       const response = await axios.post(
// //         "http://localhost:8080/api/readings",
// //         readingData
// //       );

// //       // Store the response returned by the backend
// //       const savedReading = response.data;

// //       // Update the dashboard with the saved reading
// //       setReading({
// //         temperature: savedReading.temperature,
// //         voltage: savedReading.voltage,
// //         current: savedReading.current,
// //         coolantTemperature: coolant,
// //         risk: savedReading.riskLevel,
// //         time: new Date(savedReading.timestamp).toLocaleTimeString(),
// //         batteryId: savedReading.batteryId
// //       });

// //       // Clear the sensor input fields after successful submission
// //       setTemperature("");
// //       setVoltage("");
// //       setCurrent("");
// //       setCoolantTemperature("");

// //     } catch (error) {
// //       console.error("Sensor reading submission error:", error);

// //       // Display the actual error returned by Spring Boot
// //       if (error.response) {
// //         setError(
// //           error.response.data.message ||
// //           `Server error: ${error.response.status}`
// //         );
// //       } else if (error.request) {
// //         setError("Cannot connect to the backend. Check Spring Boot.");
// //       } else {
// //         setError(error.message);
// //       }
// //     }
// //   }
// //   }

// //   return (
// //     <div className="dashboard">
// //           {/* Battery registration section */}
// //       <section className="panel">
// //         <h2>Register a New Battery</h2>

// //         <p>
// //           Enter the technical specifications of the battery before
// //           submitting its sensor readings.
// //         </p>

// //         <form className="sensor-form" onSubmit={handleBatterySubmit}>
// //                     {/* <label>
// //             Select Battery

// //             <select
// //               value={selectedBatteryId}
// //               onChange={(e) => setSelectedBatteryId(e.target.value)}
// //               required
// //             >
// //               <option value="">-- Select a registered battery --</option>

// //               {batteries.map((battery) => (
// //                 <option key={battery.id} value={battery.batteryId}>
// //                   {battery.batteryId} - {battery.batteryType}
// //                 </option>
// //               ))}
// //             </select>
// //           </label> */}

// //           <label>
// //             Battery ID
// //             <input
// //               type="text"
// //               value={batteryId}
// //               onChange={(e) => setBatteryId(e.target.value)}
// //               placeholder="e.g. EV_BAT_002"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Battery Type
// //             <input
// //               type="text"
// //               value={batteryType}
// //               onChange={(e) => setBatteryType(e.target.value)}
// //               placeholder="e.g. Lithium-ion"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Nominal Voltage (V)
// //             <input
// //               type="number"
// //               step="any"
// //               value={nominalVoltage}
// //               onChange={(e) => setNominalVoltage(e.target.value)}
// //               placeholder="e.g. 400"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Minimum Voltage (V)
// //             <input
// //               type="number"
// //               step="any"
// //               value={minimumVoltage}
// //               onChange={(e) => setMinimumVoltage(e.target.value)}
// //               placeholder="e.g. 300"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Maximum Voltage (V)
// //             <input
// //               type="number"
// //               step="any"
// //               value={maximumVoltage}
// //               onChange={(e) => setMaximumVoltage(e.target.value)}
// //               placeholder="e.g. 450"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Warning Temperature (°C)
// //             <input
// //               type="number"
// //               step="any"
// //               value={warningTemperature}
// //               onChange={(e) => setWarningTemperature(e.target.value)}
// //               placeholder="e.g. 40"
// //               required
// //             />
// //           </label>

// //           <label>
// //             Critical Temperature (°C)
// //             <input
// //               type="number"
// //               step="any"
// //               value={criticalTemperature}
// //               onChange={(e) => setCriticalTemperature(e.target.value)}
// //               placeholder="e.g. 50"
// //               required
// //             />
// //           </label>

// //           <button type="submit">
// //             Register Battery
// //           </button>

// //         </form>

// //         {/* Show registration success or error */}
// //         {batteryMessage && (
// //           <p style={{ color: "green" }}>{batteryMessage}</p>
// //         )}

// //         {batteryError && (
// //           <p style={{ color: "red" }}>{batteryError}</p>
// //         )}
// //       </section>

// //             {/* Display batteries retrieved from the backend */}
// //       <section className="panel">
// //         <h2>Registered Batteries</h2>

// //         {batteries.length === 0 ? (
// //           <p>No batteries registered yet.</p>
// //         ) : (
// //           <div>
// //             {batteries.map((battery) => (
// //               <div
// //                 key={battery.id}
// //                 className="card"
// //                 style={{ marginBottom: "15px" }}
// //               >
// //                 <h3>{battery.batteryId}</h3>

// //                 <p>Battery Type: {battery.batteryType}</p>

// //                 <p>
// //                   Nominal Voltage: {battery.nominalVoltage} V
// //                 </p>

// //                 <p>
// //                   Voltage Range: {battery.minimumVoltage} V -
// //                   {battery.maximumVoltage} V
// //                 </p>

// //                 <p>
// //                   Warning Temperature: {battery.warningTemperature} °C
// //                 </p>

// //                 <p>
// //                   Critical Temperature: {battery.criticalTemperature} °C
// //                 </p>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </section>








// //       <header className="header">
// //         <div>
// //           <h1>EV Battery Thermal Monitoring</h1>
// //           <p>AI-Enabled Micro-channel Battery Thermal Management</p>
// //         </div>
// //         <span className="system-status">● Dashboard Active</span>
// //       </header>

// //       <section className="summary">
// //         <div className="card">
// //           <p>Battery Temperature</p>
// //           <h2>{reading ? `${reading.temperature} °C` : "-- °C"}</h2>
// //           <span>Latest submitted reading</span>
// //         </div>

// //         <div className="card">
// //           <p>Battery Voltage</p>
// //           <h2>{reading ? `${reading.voltage} V` : "-- V"}</h2>
// //           <span>Pack voltage</span>
// //         </div>

// //         <div className="card">
// //           <p>Current</p>
// //           <h2>{reading ? `${reading.current} A` : "-- A"}</h2>
// //           <span>Current reading</span>
// //         </div>

// //         <div className="card">
// //           <p>Thermal Risk</p>
// //           <h2>{reading ? reading.risk : "NO DATA"}</h2>
// //           <span>{reading ? "Calculated from submitted values" : "Submit a reading to begin"}</span>
// //         </div>
// //       </section>

// //       <section className="panel">
// //         <h2>Battery Sensor Reading</h2>
// //                 <form className="sensor-form" onSubmit={handleSubmit}>

// //           {/* Select the registered battery */}
// //           <label>
// //             Select Battery
// //             <select
// //               value={selectedBatteryId}
// //               onChange={(e) => setSelectedBatteryId(e.target.value)}
// //               required
// //             >
// //               <option value="">-- Select a registered battery --</option>

// //               {batteries.map((battery) => (
// //                 <option key={battery.id} value={battery.batteryId}>
// //                   {battery.batteryId} - {battery.batteryType}
// //                 </option>
// //               ))}
// //             </select>
// //           </label>

// //           {/* Enter battery temperature */}
// //           <label>
// //             Temperature (°C)
// //             <input
// //               type="number"
// //               step="any"
// //               value={temperature}
// //               onChange={(e) => setTemperature(e.target.value)}
// //               placeholder="e.g. 35"
// //               required
// //             />
// //           </label>

// //           {/* Enter battery voltage */}
// //           <label>
// //             Voltage (V)
// //             <input
// //               type="number"
// //               step="any"
// //               min="0"
// //               value={voltage}
// //               onChange={(e) => setVoltage(e.target.value)}
// //               placeholder="e.g. 380"
// //               required
// //             />
// //           </label>

// //           {/* Enter battery current */}
// //           <label>
// //             Current (A)
// //             <input
// //               type="number"
// //               step="any"
// //               value={current}
// //               onChange={(e) => setCurrent(e.target.value)}
// //               placeholder="e.g. 45"
// //               required
// //             />
// //           </label>

// //           {/* Enter coolant temperature */}
// //           <label>
// //             Coolant Temperature (°C)
// //             <input
// //               type="number"
// //               step="any"
// //               value={coolantTemperature}
// //               onChange={(e) => setCoolantTemperature(e.target.value)}
// //               placeholder="e.g. 31"
// //               required
// //             />
// //           </label>

// //           <button type="submit">Analyze Reading</button>

// //         </form>
       
// //         {error && <p style={{ color: "red" }}>{error}</p>}
// //       </section>

// //       <section className="panel">
// //         <h2>Latest Analysis</h2>

// //         {!reading ? (
// //           <p>Submit a sensor reading to see the thermal analysis.</p>
// //         ) : (
// //           <>
// //             <p>Recorded at: {reading.time}</p>
// //             <p>
// //               Coolant temperature: {reading.coolantTemperature} °C
// //             </p>
// //             <p>
// //               Risk result: <strong>{reading.risk}</strong>
// //             </p>
// //             <p>
// //               {reading.risk === "CRITICAL"
// //                 ? "Critical temperature detected. Stop the test safely and inspect the cooling system."
// //                 : reading.risk === "WARNING"
// //                 ? "Elevated thermal risk. Check coolant temperature and cooling circulation."
// //                 : "Temperature is within this prototype's configured normal range."}
// //             </p>
// //           </>
// //         )}
// //       </section>

// //       <footer>
// //         EV Battery Thermal Monitoring Dashboard · Academic Prototype
// //       </footer>
// //     </div>
// //   );
// // }

// // export default App;
