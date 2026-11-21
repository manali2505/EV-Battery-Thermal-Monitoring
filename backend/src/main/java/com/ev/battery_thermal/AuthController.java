
package com.ev.battery_thermal;

import java.util.Map;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:3000")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://ev-battery-thermal-monitoring.vercel.app"
})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

   public AuthController(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtEncoder jwtEncoder) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtEncoder = jwtEncoder;
}

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username and password are required"));
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must contain at least 8 characters"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }

        // Encrypt the password before saving it
        User user = new User(
                username.trim(),
                passwordEncoder.encode(password)
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "User registered successfully",
                        "username", user.getUsername()
                ));
    }



@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

    String username = request.get("username");
    String password = request.get("password");

    if (username == null || username.isBlank()
            || password == null || password.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Username and password are required"));
    }

    // Find the registered user
    User user = userRepository.findByUsername(username.trim())
            .orElse(null);

    // Verify the password against the stored BCrypt hash
    if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
    }

    // Generate JWT token valid for one hour
    Instant now = Instant.now();

    JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("ev-battery-thermal")
            .issuedAt(now)
            .expiresAt(now.plus(1, ChronoUnit.HOURS))
            .subject(user.getUsername())
            .claim("scope", user.getRole())
            .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

    String token = jwtEncoder.encode(
            JwtEncoderParameters.from(header, claims)
    ).getTokenValue();

    return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "username", user.getUsername(),
            "accessToken", token,
            "tokenType", "Bearer",
            "expiresIn", 3600
    ));
}

}
