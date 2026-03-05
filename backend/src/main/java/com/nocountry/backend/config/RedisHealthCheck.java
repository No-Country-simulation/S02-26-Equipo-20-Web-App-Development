package com.nocountry.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;

@Configuration
@Slf4j
public class RedisHealthCheck {

    @Bean
    public CommandLineRunner checkRedisConnection(RedisConnectionFactory connectionFactory) {
        return _ -> {
            try {
                connectionFactory.getConnection().ping();
                log.info("Conexión a Redis establecida correctamente");
            } catch (Exception e) {
                log.error("Error al conectar con Redis: {}", e.getMessage());
            }
        };
    }
}
