package com.nocountry.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Getter
@RequiredArgsConstructor
public class RedisStreamInitializer {

    @Value( "${redis.stream.job.name}")
    private String streamJobName;

    @Value( "${redis.stream.result.name}")
    private String streamResultName;

    @Value( "${redis.consumer.job.group}")
    private String consumerJobGroup;

    @Value( "${redis.consumer.result.group}")
    private String consumerResultGroup;

    @Getter(AccessLevel.NONE)
    private final StringRedisTemplate stringRedisTemplate;

    @PostConstruct
    public void initializeStreamsAndConsumerGroups(){
        try{
            streamExists(streamJobName);
            streamExists(streamResultName);
            createConsumerGroupIfNotExists(streamJobName,consumerJobGroup);
            createConsumerGroupIfNotExists(streamResultName,consumerResultGroup);

        }catch (Exception e){
            log.error("Error al inicializar stream y grupo: {}", e.getMessage(), e);
        }
    }

    private void streamExists(String streamName) {
        try {
            stringRedisTemplate.opsForStream().info(streamName);
            log.info("Stream '{}' ya existe.", streamName);
        } catch (Exception _) {
            log.info("Stream '{}' no existe. Se creará al publicar el primer mensaje.", streamName);
        }
    }

    private void createConsumerGroupIfNotExists(String streamName, String groupName) {
        try {
            stringRedisTemplate.opsForStream()
                    .createGroup(streamName, ReadOffset.from("0"), groupName);

            log.info("Grupo de consumidores '{}' creado exitosamente para el stream '{}'",
                    groupName, streamName);

        } catch (Exception e) {
            if (e.getMessage() != null && e.getCause().getMessage().contains("BUSYGROUP")) {
                log.info("Grupo de consumidores '{}' ya existe para el stream '{}'",
                        groupName, streamName);
            } else {
                log.error("Error al crear grupo de consumidores: {}", e.getMessage());
            }
        }
    }
}