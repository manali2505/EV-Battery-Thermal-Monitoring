
package com.ev.battery_thermal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/batteries")
@CrossOrigin(origins = "http://localhost:3000")
@SecurityRequirement(name = "bearerAuth")
public class BatteryConfigurationController {

    private final BatteryConfigurationRepository repository;

    // Constructor injection
    public BatteryConfigurationController(
            BatteryConfigurationRepository repository) {
        this.repository = repository;
    }

    // Get all registered battery configurations
    @GetMapping
    public List<BatteryConfiguration> getAllBatteries() {
        return repository.findAll();
    }

    // Get one battery using its Battery ID
    @GetMapping("/{batteryId}")
    public BatteryConfiguration getBattery(
            @PathVariable String batteryId) {

        return repository.findByBatteryId(batteryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Battery configuration not found"));
    }

    // Register a new battery configuration
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BatteryConfiguration createBattery(
            @RequestBody BatteryConfiguration battery) {

        validateBattery(battery);

        if (repository.existsByBatteryId(battery.getBatteryId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Battery ID already exists");
        }

        battery.setId(null);
        return repository.save(battery);
    }

    // Update an existing battery configuration
    @PutMapping("/{batteryId}")
    public BatteryConfiguration updateBattery(
            @PathVariable String batteryId,
            @RequestBody BatteryConfiguration updatedBattery) {

        BatteryConfiguration existing = repository
                .findByBatteryId(batteryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Battery configuration not found"));

        validateBattery(updatedBattery);

        // Prevent changing the unique Battery ID through this endpoint
        updatedBattery.setBatteryId(batteryId);

        existing.setBatteryType(updatedBattery.getBatteryType());
        existing.setNominalVoltage(updatedBattery.getNominalVoltage());
        existing.setMinimumVoltage(updatedBattery.getMinimumVoltage());
        existing.setMaximumVoltage(updatedBattery.getMaximumVoltage());
        existing.setWarningTemperature(
                updatedBattery.getWarningTemperature());
        existing.setCriticalTemperature(
                updatedBattery.getCriticalTemperature());

        return repository.save(existing);
    }

    // Delete a battery configuration
    @DeleteMapping("/{batteryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBattery(@PathVariable String batteryId) {

        BatteryConfiguration existing = repository
                .findByBatteryId(batteryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Battery configuration not found"));

        repository.delete(existing);
    }

    // Validate battery specifications before saving
    private void validateBattery(BatteryConfiguration battery) {

        if (battery.getBatteryId() == null
                || battery.getBatteryId().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Battery ID is required");
        }

        if (battery.getBatteryType() == null
                || battery.getBatteryType().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Battery type is required");
        }

        if (battery.getMinimumVoltage() <= 0
                || battery.getNominalVoltage() <= 0
                || battery.getMaximumVoltage() <= 0
                || battery.getMinimumVoltage()
                    >= battery.getNominalVoltage()
                || battery.getNominalVoltage()
                    >= battery.getMaximumVoltage()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Voltage values must satisfy minimum < nominal < maximum");
        }

        if (battery.getWarningTemperature() <= 0
                || battery.getCriticalTemperature()
                    <= battery.getWarningTemperature()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Critical temperature must be greater than warning temperature");
        }
    }
}
