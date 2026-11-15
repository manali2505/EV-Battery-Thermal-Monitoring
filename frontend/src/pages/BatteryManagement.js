
import React from "react";

function BatteryManagement({
  batteryId,
  setBatteryId,
  batteryType,
  setBatteryType,
  nominalVoltage,
  setNominalVoltage,
  minimumVoltage,
  setMinimumVoltage,
  maximumVoltage,
  setMaximumVoltage,
  warningTemperature,
  setWarningTemperature,
  criticalTemperature,
  setCriticalTemperature,
  handleBatterySubmit,
  batteries,
  batteryMessage,
  batteryError
}) {
  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Battery Management</h1>
          <p>Register and manage battery configurations</p>
        </div>
      </header>

      <section className="panel">
        <h2>Register a New Battery</h2>

        <p>
          Enter the technical specifications of the battery before
          submitting its sensor readings.
        </p>

        <form className="sensor-form" onSubmit={handleBatterySubmit}>
          <label>
            Battery ID
            <input
              type="text"
              value={batteryId}
              onChange={(e) => setBatteryId(e.target.value)}
              placeholder="e.g. EV_BAT_002"
              required
            />
          </label>

          <label>
            Battery Type
            <input
              type="text"
              value={batteryType}
              onChange={(e) => setBatteryType(e.target.value)}
              placeholder="e.g. Lithium-ion"
              required
            />
          </label>

          <label>
            Nominal Voltage (V)
            <input
              type="number"
              step="any"
              value={nominalVoltage}
              onChange={(e) => setNominalVoltage(e.target.value)}
              placeholder="e.g. 400"
              required
            />
          </label>

          <label>
            Minimum Voltage (V)
            <input
              type="number"
              step="any"
              value={minimumVoltage}
              onChange={(e) => setMinimumVoltage(e.target.value)}
              placeholder="e.g. 300"
              required
            />
          </label>

          <label>
            Maximum Voltage (V)
            <input
              type="number"
              step="any"
              value={maximumVoltage}
              onChange={(e) => setMaximumVoltage(e.target.value)}
              placeholder="e.g. 450"
              required
            />
          </label>

          <label>
            Warning Temperature (°C)
            <input
              type="number"
              step="any"
              value={warningTemperature}
              onChange={(e) => setWarningTemperature(e.target.value)}
              placeholder="e.g. 40"
              required
            />
          </label>

          <label>
            Critical Temperature (°C)
            <input
              type="number"
              step="any"
              value={criticalTemperature}
              onChange={(e) => setCriticalTemperature(e.target.value)}
              placeholder="e.g. 50"
              required
            />
          </label>

          <button type="submit">Register Battery</button>
        </form>

        {batteryMessage && (
          <p style={{ color: "green" }}>{batteryMessage}</p>
        )}

        {batteryError && (
          <p style={{ color: "red" }}>{batteryError}</p>
        )}
      </section>

      <section className="panel">
        <h2>Registered Batteries</h2>

        {batteries.length === 0 ? (
          <p>No batteries registered yet.</p>
        ) : (
          <div>
            {batteries.map((battery) => (
              <div
                key={battery.id}
                className="card"
                style={{ marginBottom: "15px" }}
              >
                <h3>{battery.batteryId}</h3>

                <p>Battery Type: {battery.batteryType}</p>

                <p>
                  Nominal Voltage: {battery.nominalVoltage} V
                </p>

                <p>
                  Voltage Range: {battery.minimumVoltage} V -
                  {battery.maximumVoltage} V
                </p>

                <p>
                  Warning Temperature: {battery.warningTemperature} °C
                </p>

                <p>
                  Critical Temperature: {battery.criticalTemperature} °C
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BatteryManagement;
