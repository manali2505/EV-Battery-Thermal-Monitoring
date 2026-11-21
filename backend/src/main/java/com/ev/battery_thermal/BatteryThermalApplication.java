package com.ev.battery_thermal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BatteryThermalApplication {

	// public static void main(String[] args) {
	// 	SpringApplication.run(BatteryThermalApplication.class, args);
	// }

	public static void main(String[] args) {

    String mongoUri = System.getenv("MONGODB_URI");

    System.out.println("========== MONGODB CHECK ==========");
    System.out.println("MONGODB_URI available: " + (mongoUri != null && !mongoUri.isBlank()));

    if (mongoUri != null) {
        System.out.println("Atlas URI detected: " + mongoUri.startsWith("mongodb+srv://"));
    }

    System.out.println("===================================");

    SpringApplication.run(BatteryThermalApplication.class, args);
}

}
