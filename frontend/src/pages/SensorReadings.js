
import React from "react";

function SensorReadings({
  selectedBatteryId,
  setSelectedBatteryId,
  batteries,
  temperature,
  setTemperature,
  voltage,
  setVoltage,
  current,
  setCurrent,
  coolantTemperature,
  setCoolantTemperature,
  handleSubmit,
  error
}) {
  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Sensor Readings</h1>
          <p>Submit battery sensor observations for thermal analysis</p>
        </div>
      </header>

      <section className="panel">
        <h2>Battery Sensor Reading</h2>

        <form className="sensor-form" onSubmit={handleSubmit}>
          <label>
            Select Battery
            <select
              value={selectedBatteryId}
              onChange={(e) => setSelectedBatteryId(e.target.value)}
              required
            >
              <option value="">-- Select a registered battery --</option>

              {batteries.map((battery) => (
                <option key={battery.id} value={battery.batteryId}>
                  {battery.batteryId} - {battery.batteryType}
                </option>
              ))}
            </select>
          </label>

          <label>
            Temperature (°C)
            <input
              type="number"
              step="any"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 35"
              required
            />
          </label>

          <label>
            Voltage (V)
            <input
              type="number"
              step="any"
              min="0"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="e.g. 380"
              required
            />
          </label>

          <label>
            Current (A)
            <input
              type="number"
              step="any"
              max="1000"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="e.g. 45"
              required
            />
          </label>

          <label>
            Coolant Temperature (°C)
            <input
              type="number"
              step="any"
              value={coolantTemperature}
              onChange={(e) => setCoolantTemperature(e.target.value)}
              placeholder="e.g. 31"
              required
            />
          </label>

          <button type="submit">Analyze Reading</button>
        </form>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}
      </section>
    </div>
  );
}

export default SensorReadings;

