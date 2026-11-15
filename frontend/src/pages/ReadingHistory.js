
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function ReadingHistory({
  historicalReadings,
  historyLoading,
  historyError
}) {
  const chartData = historicalReadings.map((item) => ({
    time: item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString()
      : "N/A",
    temperature: item.temperature
  }));

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Reading History</h1>
          <p>Review previously recorded battery sensor readings</p>
        </div>
      </header>

      <section className="panel">
        <h2>Temperature Trend</h2>

        {historyLoading ? (
          <p>Loading reading history...</p>
        ) : historicalReadings.length === 0 ? (
          <p>No historical readings available for the selected battery.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  label={{
                    value: "Temperature (°C)",
                    angle: -90,
                    position: "insideLeft"
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#e63946"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Historical Sensor Records</h2>

        {historyError && (
          <p style={{ color: "red" }}>{historyError}</p>
        )}

        {historyLoading ? (
          <p>Loading records...</p>
        ) : historicalReadings.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Battery ID</th>
                  <th>Temperature (°C)</th>
                  <th>Voltage (V)</th>
                  <th>Current (A)</th>
                  <th>Risk Level</th>
                  <th>Cooling Demand (ML)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {historicalReadings.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.batteryId}</td>
                    <td>{item.temperature}</td>
                    <td>{item.voltage}</td>
                    <td>{item.current}</td>
                    <td>{item.riskLevel}</td>
                    <td>
                      {item.coolingRequirement || "N/A"}
                    </td>
                    <td>
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ReadingHistory;



// import React from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip
// } from "recharts";

// function ReadingHistory({
//   historicalReadings,
//   historyLoading,
//   historyError
// }) {
//   const chartData = historicalReadings.map((item) => ({
//     time: item.timestamp
//       ? new Date(item.timestamp).toLocaleTimeString()
//       : "N/A",
//     temperature: item.temperature
//   }));

//   return (
//     <div className="dashboard">
//       <header className="header">
//         <div>
//           <h1>Reading History</h1>
//           <p>Review previously recorded battery sensor readings</p>
//         </div>
//       </header>

//       <section className="panel">
//         <h2>Temperature Trend</h2>

//         {historyLoading ? (
//           <p>Loading reading history...</p>
//         ) : historicalReadings.length === 0 ? (
//           <p>No historical readings available for the selected battery.</p>
//         ) : (
//           <div style={{ width: "100%", height: 300 }}>
//             <ResponsiveContainer>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" />
//                 <YAxis
//                   label={{
//                     value: "Temperature (°C)",
//                     angle: -90,
//                     position: "insideLeft"
//                   }}
//                 />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="temperature"
//                   stroke="#e63946"
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </section>

//       <section className="panel">
//         <h2>Historical Sensor Records</h2>

//         {historyError && (
//           <p style={{ color: "red" }}>{historyError}</p>
//         )}

//         {historyLoading ? (
//           <p>Loading records...</p>
//         ) : historicalReadings.length === 0 ? (
//           <p>No records found.</p>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Battery ID</th>
//                   <th>Temperature (°C)</th>
//                   <th>Voltage (V)</th>
//                   <th>Current (A)</th>
//                   <th>Risk Level</th>
//                   <th>Timestamp</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {historicalReadings.map((item, index) => (
//                   <tr key={item.id || index}>
//                     <td>{item.batteryId}</td>
//                     <td>{item.temperature}</td>
//                     <td>{item.voltage}</td>
//                     <td>{item.current}</td>
//                     <td>{item.riskLevel}</td>
//                     <td>
//                       {item.timestamp
//                         ? new Date(item.timestamp).toLocaleString()
//                         : "N/A"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// export default ReadingHistory;
