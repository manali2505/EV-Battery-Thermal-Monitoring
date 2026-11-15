


import React from "react";

function Alerts({ historicalReadings }) {
  const alerts = historicalReadings.filter(
    (item) =>
      item.riskLevel === "WARNING" ||
      item.riskLevel === "CRITICAL"
  );

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Thermal Alerts & Recommendations</h1>
          <p>
            Monitor battery thermal warnings and intelligent cooling assessments
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Alert Summary</h2>

        <div className="summary">
          <div className="card">
            <p>Total Alerts</p>
            <h2>{alerts.length}</h2>
          </div>

          <div className="card">
            <p>Warning Alerts</p>
            <h2>
              {alerts.filter(
                (item) => item.riskLevel === "WARNING"
              ).length}
            </h2>
          </div>

          <div className="card">
            <p>Critical Alerts</p>
            <h2>
              {alerts.filter(
                (item) => item.riskLevel === "CRITICAL"
              ).length}
            </h2>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Alert Records & Cooling Assessments</h2>

        {alerts.length === 0 ? (
          <p>No warning or critical readings found.</p>
        ) : (
          alerts.map((item, index) => (
            <div
              key={item.id || index}
              className="card"
              style={{
                marginBottom: "15px",
                borderLeft:
                  item.riskLevel === "CRITICAL"
                    ? "5px solid #dc3545"
                    : "5px solid #ffc107"
              }}
            >
              <h3>
                {item.riskLevel === "CRITICAL"
                  ? "Critical Thermal Alert"
                  : "Thermal Warning"}
              </h3>

              <p>Battery ID: {item.batteryId}</p>
              <p>Temperature: {item.temperature} °C</p>
              <p>Coolant Temperature: {item.coolantTemperature} °C</p>
              <p>Voltage: {item.voltage} V</p>
              <p>Current: {item.current} A</p>

              <p>
                Thermal Risk Level: <strong>{item.riskLevel}</strong>
              </p>

              <p>
                ML Cooling Demand:{" "}
                <strong>
                  {item.coolingRequirement || "N/A"}
                </strong>
              </p>

              <p>
                Timestamp:{" "}
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : "N/A"}
              </p>

              <p>
                {item.riskLevel === "CRITICAL"
                  ? "Recommended action: Stop the test safely and inspect the battery cooling system."
                  : "Recommended action: Monitor the battery temperature and check coolant circulation."}
              </p>

              <p>
                {item.coolingRequirement === "HIGH"
                  ? "ML Assessment: High cooling demand predicted. Increased cooling attention is recommended."
                  : item.coolingRequirement === "MEDIUM"
                  ? "ML Assessment: Moderate cooling demand predicted. Continue monitoring battery and coolant temperatures."
                  : item.coolingRequirement === "LOW"
                  ? "ML Assessment: Low cooling demand predicted by the Random Forest model."
                  : "ML Assessment: No cooling prediction available for this record."}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Alerts;
// import React from "react";

// function Alerts({ historicalReadings }) {
//   const alerts = historicalReadings.filter(
//     (item) =>
//       item.riskLevel === "WARNING" ||
//       item.riskLevel === "CRITICAL"
//   );

//   return (
//     <div className="dashboard">
//       <header className="header">
//         <div>
//           <h1>Thermal Alerts</h1>
//           <p>Monitor battery thermal warnings and critical conditions</p>
//         </div>
//       </header>

//       <section className="panel">
//         <h2>Alert Summary</h2>

//         <div className="summary">
//           <div className="card">
//             <p>Total Alerts</p>
//             <h2>{alerts.length}</h2>
//           </div>

//           <div className="card">
//             <p>Warning Alerts</p>
//             <h2>
//               {alerts.filter(
//                 (item) => item.riskLevel === "WARNING"
//               ).length}
//             </h2>
//           </div>

//           <div className="card">
//             <p>Critical Alerts</p>
//             <h2>
//               {alerts.filter(
//                 (item) => item.riskLevel === "CRITICAL"
//               ).length}
//             </h2>
//           </div>
//         </div>
//       </section>

//       <section className="panel">
//         <h2>Alert Records</h2>

//         {alerts.length === 0 ? (
//           <p>No warning or critical readings found.</p>
//         ) : (
//           alerts.map((item, index) => (
//             <div
//               key={item.id || index}
//               className="card"
//               style={{
//                 marginBottom: "15px",
//                 borderLeft:
//                   item.riskLevel === "CRITICAL"
//                     ? "5px solid #dc3545"
//                     : "5px solid #ffc107"
//               }}
//             >
//               <h3>
//                 {item.riskLevel === "CRITICAL"
//                   ? "Critical Thermal Alert"
//                   : "Thermal Warning"}
//               </h3>

//               <p>Battery ID: {item.batteryId}</p>
//               <p>Temperature: {item.temperature} °C</p>
//               <p>Voltage: {item.voltage} V</p>
//               <p>Current: {item.current} A</p>
//               <p>Risk Level: {item.riskLevel}</p>

//               <p>
//                 Timestamp:{" "}
//                 {item.timestamp
//                   ? new Date(item.timestamp).toLocaleString()
//                   : "N/A"}
//               </p>

//               <p>
//                 {item.riskLevel === "CRITICAL"
//                   ? "Recommended action: Stop the test safely and inspect the battery cooling system."
//                   : "Recommended action: Monitor the battery temperature and check coolant circulation."}
//               </p>
//             </div>
//           ))
//         )}
//       </section>
//     </div>
//   );
// }

// export default Alerts;
