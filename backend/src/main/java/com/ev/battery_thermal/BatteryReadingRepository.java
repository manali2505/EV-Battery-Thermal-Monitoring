
package com.ev.battery_thermal;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BatteryReadingRepository
        extends MongoRepository<BatteryReading, String> {
}
