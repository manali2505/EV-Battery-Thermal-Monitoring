
package com.ev.battery_thermal;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "battery_readings")
public class BatteryReading {

    @Id
    private String id;

    private String batteryId;
    private double temperature;
    private double voltage;
    private double current;
    private double coolantTemperature;
    private String riskLevel;
    private String coolingRequirement;
    private Instant timestamp;

    public BatteryReading() {
    }

    public BatteryReading(String batteryId, double temperature,
                          double voltage, double current,
                          double coolantTemperature) {
        this.batteryId = batteryId;
        this.temperature = temperature;
        this.voltage = voltage;
        this.current = current;
        this.coolantTemperature = coolantTemperature;
        this.timestamp = Instant.now();
    }

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

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getVoltage() {
        return voltage;
    }

    public void setVoltage(double voltage) {
        this.voltage = voltage;
    }

    public double getCurrent() {
        return current;
    }

    public void setCurrent(double current) {
        this.current = current;
    }

    public double getCoolantTemperature() {
        return coolantTemperature;
    }

    public void setCoolantTemperature(double coolantTemperature) {
        this.coolantTemperature = coolantTemperature;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    public String getCoolingRequirement() {
    return coolingRequirement;
}

public void setCoolingRequirement(String coolingRequirement) {
    this.coolingRequirement = coolingRequirement;
}

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}


// package com.ev.battery_thermal;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// import java.time.Instant;

// @Document(collection = "battery_readings")
// public class BatteryReading {

//     @Id
//     private String id;

//     private String batteryId;
//     private double temperature;
//     private double voltage;
//     private double current;
//     private String riskLevel;
//     private Instant timestamp;

//     public BatteryReading() {
//     }

//     public BatteryReading(String batteryId, double temperature,
//                           double voltage, double current) {
//         this.batteryId = batteryId;
//         this.temperature = temperature;
//         this.voltage = voltage;
//         this.current = current;
//         this.timestamp = Instant.now();
//     }

//     public String getId() {
//         return id;
//     }

//     public void setId(String id) {
//         this.id = id;
//     }

//     public String getBatteryId() {
//         return batteryId;
//     }

//     public void setBatteryId(String batteryId) {
//         this.batteryId = batteryId;
//     }

//     public double getTemperature() {
//         return temperature;
//     }

//     public void setTemperature(double temperature) {
//         this.temperature = temperature;
//     }

//     public double getVoltage() {
//         return voltage;
//     }

//     public void setVoltage(double voltage) {
//         this.voltage = voltage;
//     }

//     public double getCurrent() {
//         return current;
//     }

//     public void setCurrent(double current) {
//         this.current = current;
//     }

//     public String getRiskLevel() {
//         return riskLevel;
//     }

//     public void setRiskLevel(String riskLevel) {
//         this.riskLevel = riskLevel;
//     }

//     public Instant getTimestamp() {
//         return timestamp;
//     }

//     public void setTimestamp(Instant timestamp) {
//         this.timestamp = timestamp;
//     }
// }
