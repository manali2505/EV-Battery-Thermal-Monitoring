
package com.ev.battery_thermal;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("EV Battery Thermal Monitoring API")
                        .description("API documentation for battery monitoring, sensor readings and cooling prediction.")
                        .version("1.0.0"))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}





// package com.ev.battery_thermal;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// import io.swagger.v3.oas.models.Components;
// import io.swagger.v3.oas.models.OpenAPI;
// import io.swagger.v3.oas.models.security.SecurityRequirement;
// import io.swagger.v3.oas.models.security.SecurityScheme;

// @Configuration
// public class OpenApiConfig {

//     @Bean
//     public OpenAPI customOpenAPI() {

//         final String securitySchemeName = "bearerAuth";

//         return new OpenAPI()
//                 .info(new io.swagger.v3.oas.models.info.Info()
//                         .title("EV Battery Thermal Monitoring API")
//                         .description("API documentation for battery monitoring, sensor readings and cooling prediction.")
//                         .version("1.0.0"))
//                 .components(new Components()
//                         .addSecuritySchemes(securitySchemeName,
//                                 new SecurityScheme()
//                                         .name(securitySchemeName)
//                                         .type(SecurityScheme.Type.HTTP)
//                                         .scheme("bearer")
//                                         .bearerFormat("JWT")))
//                 .addSecurityItem(
//                         new SecurityRequirement()
//                                 .addList(securitySchemeName));
//     }
// }
