
import React from "react";

function Dashboard({ reading }) {
  const coolingRequirement = reading
    ? reading.coolingRequirement
    : null;

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>EV Battery Thermal Monitoring</h1>
          <p>AI-Enabled Micro-channel Battery Thermal Management</p>
        </div>

        <span className="system-status">● Dashboard Active</span>
      </header>

      <section className="summary">
        <div className="card">
          <p>Battery Temperature</p>
          <h2>{reading ? `${reading.temperature} °C` : "-- °C"}</h2>
          <span>Latest submitted reading</span>
        </div>

        <div className="card">
          <p>Battery Voltage</p>
          <h2>{reading ? `${reading.voltage} V` : "-- V"}</h2>
          <span>Pack voltage</span>
        </div>

        <div className="card">
          <p>Current</p>
          <h2>{reading ? `${reading.current} A` : "-- A"}</h2>
          <span>Current reading</span>
        </div>

        <div className="card">
          <p>Thermal Risk</p>
          <h2>{reading ? reading.risk : "NO DATA"}</h2>
          <span>Existing Java risk calculation</span>
        </div>
      </section>

      <section className="panel">
        <h2>Latest Thermal Analysis</h2>

        {!reading ? (
          <p>Submit a sensor reading to see the thermal analysis.</p>
        ) : (
          <>
            <p>Recorded at: {reading.time}</p>

            <p>
              Coolant temperature: {reading.coolantTemperature} °C
            </p>

            <p>
              Thermal risk: <strong>{reading.risk}</strong>
            </p>

            <p>
              {reading.risk === "CRITICAL"
                ? "Critical temperature detected. Stop the test safely and inspect the cooling system."
                : reading.risk === "WARNING"
                ? "Elevated thermal risk. Check coolant temperature and cooling circulation."
                : "Temperature is within this prototype's configured normal range."}
            </p>
          </>
        )}
      </section>

      <section className="panel analysis-panel">
        <h2>Intelligent Cooling Demand Assessment</h2>

        {!reading ? (
          <p>Submit a sensor reading to generate a cooling prediction.</p>
        ) : (
          <>
            <p>
              Predicted Cooling Requirement:
              {" "}
              <strong>
                {coolingRequirement || "NOT AVAILABLE"}
              </strong>
            </p>

            <p>
              {coolingRequirement === "HIGH"
                ? "High cooling requirement predicted. Increased cooling attention is recommended."
                : coolingRequirement === "MEDIUM"
                ? "Medium cooling requirement predicted. Monitor battery and coolant temperatures."
                : coolingRequirement === "LOW"
                ? "Low cooling requirement predicted. The model indicates a relatively low cooling demand."
                : "No cooling prediction is available for this reading."}
            </p>

            <span>
              Prediction generated using the trained Random Forest ML model.
            </span>
          </>
        )}
      </section>
    </div>
  );
}

export default Dashboard;



// import React from "react";

// function Dashboard({ reading }) {
//   return (
//     <div className="dashboard">
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
//           <span>
//             {reading
//               ? "Calculated from submitted values"
//               : "Submit a reading to begin"}
//           </span>
//         </div>
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
//     </div>
//   );
// }

// export default Dashboard;
