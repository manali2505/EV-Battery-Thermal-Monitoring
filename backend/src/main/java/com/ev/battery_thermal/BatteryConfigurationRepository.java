
package com.ev.battery_thermal;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

// Provides database operations for battery configurations.
public interface BatteryConfigurationRepository
        extends MongoRepository<BatteryConfiguration, String> {

    // Finds a battery configuration using its unique Battery ID.
    Optional<BatteryConfiguration> findByBatteryId(String batteryId);

    // Checks whether a Battery ID is already registered.
    boolean existsByBatteryId(String batteryId);
}
