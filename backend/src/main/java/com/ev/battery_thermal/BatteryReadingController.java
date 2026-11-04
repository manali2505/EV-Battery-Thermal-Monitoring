
package com.ev.battery_thermal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/readings")
@CrossOrigin(origins = "http://localhost:3000")
public class BatteryReadingController {

    private final BatteryReadingRepository readingRepository;
    private final BatteryConfigurationRepository configurationRepository;

    // Constructor injection for both repositories
    public BatteryReadingController(
            BatteryReadingRepository readingRepository,
            BatteryConfigurationRepository configurationRepository) {

        this.readingRepository = readingRepository;
        this.configurationRepository = configurationRepository;
    }

    // Retrieve all battery readings
    @GetMapping
    public List<BatteryReading> getAllReadings() {
        return readingRepository.findAll();
    }

    // Retrieve readings belonging to a particular battery
    @GetMapping("/battery/{batteryId}")
    public List<BatteryReading> getReadingsByBattery(
            @PathVariable String batteryId) {

        if (!configurationRepository.existsByBatteryId(batteryId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Battery configuration not found");
        }

        return readingRepository.findAll().stream()
                .filter(reading ->
                        reading.getBatteryId().equals(batteryId))
                .toList();
    }

    // Retrieve one reading by MongoDB ID
    @GetMapping("/{id}")
    public BatteryReading getReadingById(@PathVariable String id) {

        return readingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reading not found"));
    }

    // Save a new battery reading
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BatteryReading createReading(
            @RequestBody BatteryReading reading) {

        BatteryConfiguration battery = getBatteryConfiguration(
                reading.getBatteryId());

        validateReading(reading, battery);

        reading.setId(null);
        reading.setTimestamp(Instant.now());

        reading.setRiskLevel(
                calculateRisk(
                        reading.getTemperature(),
                        battery));

        return readingRepository.save(reading);
    }

    // Update an existing battery reading
    @PutMapping("/{id}")
    public BatteryReading updateReading(
            @PathVariable String id,
            @RequestBody BatteryReading updatedReading) {

        BatteryReading existing = readingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reading not found"));

        // Do not allow an existing reading to be moved
        // to another battery through this endpoint.
        BatteryConfiguration battery = getBatteryConfiguration(
                existing.getBatteryId());

        validateReading(updatedReading, battery);

        existing.setTemperature(updatedReading.getTemperature());
        existing.setVoltage(updatedReading.getVoltage());
        existing.setCurrent(updatedReading.getCurrent());

        existing.setRiskLevel(
                calculateRisk(
                        existing.getTemperature(),
                        battery));

        existing.setTimestamp(Instant.now());

        return readingRepository.save(existing);
    }

    // Delete a reading
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReading(@PathVariable String id) {

        if (!readingRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Reading not found");
        }

        readingRepository.deleteById(id);
    }

    // Find the configuration for a registered battery
    private BatteryConfiguration getBatteryConfiguration(
            String batteryId) {

        if (batteryId == null || batteryId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Battery ID is required");
        }

        return configurationRepository.findByBatteryId(batteryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Register this battery before submitting readings"));
    }

    // Validate readings against the battery configuration
    private void validateReading(
            BatteryReading reading,
            BatteryConfiguration battery) {

        if (!Double.isFinite(reading.getTemperature())
                || !Double.isFinite(reading.getVoltage())
                || !Double.isFinite(reading.getCurrent())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reading values must be finite numbers");
        }

        if (reading.getTemperature() < -40
                || reading.getTemperature() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Temperature is outside the supported input range");
        }

        if (reading.getVoltage() < battery.getMinimumVoltage()
                || reading.getVoltage() > battery.getMaximumVoltage()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Voltage is outside the registered battery limits");
        }

        if (Math.abs(reading.getCurrent()) > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current is outside the supported input range");
        }
    }

    // Calculate risk using the battery's own thresholds
    private String calculateRisk(
            double temperature,
            BatteryConfiguration battery) {

        if (temperature >= battery.getCriticalTemperature()) {
            return "CRITICAL";
        } else if (temperature >= battery.getWarningTemperature()) {
            return "WARNING";
        } else {
            return "NORMAL";
        }
    }
}
