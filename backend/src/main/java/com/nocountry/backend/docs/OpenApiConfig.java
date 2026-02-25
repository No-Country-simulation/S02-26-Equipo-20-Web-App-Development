package com.nocountry.backend.docs;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI();
        openAPI.info(apiInfo());
        openAPI.addServersItem(devServer());
        openAPI.components(new Components().addSecuritySchemes("cookieAuth", cookieScheme()));
        return openAPI;
    }

    private SecurityScheme cookieScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)
                .name("jwt");
    }

    private Server devServer() {
        return new Server().url("http://localhost:8080");
    }

    private Info apiInfo() {
        return new Info()
                .title("ClipFlow")
                .version("1.0-0")
                .description("""
                        ClipFlow API es un servicio backend diseñado para gestionar autenticación de usuarios 
                        y el procesamiento asíncrono de vídeos cortos.
                        
                        La arquitectura se basa en:
                        - Spring Boot 4 y Java 25.
                        - Persistencia en PostgreSQL.
                        - Coordinación de trabajos mediante Redis Streams.
                        - Worker externo en Python para procesamiento intensivo.
                        
                        La autenticación se implementa con JWT almacenado en cookie HTTP-only.
                        """);
    }
}
