
package com.ev.battery_thermal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// This class stores the technical configuration of an EV battery.
@Document(collection = "battery_configurations")
public class BatteryConfiguration {

    @Id
    private String id;

    private String batteryId;
    private String batteryType;

    // Voltage specifications in volts
    private double nominalVoltage;
    private double minimumVoltage;
    private double maximumVoltage;

    // Temperature thresholds in degrees Celsius
    private double warningTemperature;
    private double criticalTemperature;

    public BatteryConfiguration() {
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBatteryId() {
        return batteryId;
    }

    public void setBatteryId(String batteryId) {
        this.batteryId = batteryId;
    }

    public String getBatteryType() {
        return batteryType;
    }

    public void setBatteryType(String batteryType) {
        this.batteryType = batteryType;
    }

    public double getNominalVoltage() {
        return nominalVoltage;
    }

    public void setNominalVoltage(double nominalVoltage) {
        this.nominalVoltage = nominalVoltage;
    }

    public double getMinimumVoltage() {
        return minimumVoltage;
    }

    public void setMinimumVoltage(double minimumVoltage) {
        this.minimumVoltage = minimumVoltage;
    }

    public double getMaximumVoltage() {
        return maximumVoltage;
    }

    public void setMaximumVoltage(double maximumVoltage) {
        this.maximumVoltage = maximumVoltage;
    }

    public double getWarningTemperature() {
        return warningTemperature;
    }

    public void setWarningTemperature(double warningTemperature) {
        this.warningTemperature = warningTemperature;
    }

    public double getCriticalTemperature() {
        return criticalTemperature;
    }

    public void setCriticalTemperature(double criticalTemperature) {
        this.criticalTemperature = criticalTemperature;
    }
}
