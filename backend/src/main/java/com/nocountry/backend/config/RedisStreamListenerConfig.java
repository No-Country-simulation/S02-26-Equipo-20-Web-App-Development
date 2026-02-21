package com.nocountry.backend.config;

import com.nocountry.backend.service.RedisStreamInitializer;
import com.nocountry.backend.service.RedisStreamListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

import java.time.Duration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RedisStreamListenerConfig {

    private final RedisStreamInitializer redisStreamInitializer;
    private final RedisStreamListener redisStreamListener;
    private final RedisSerializer<Object> redisSerializer;

    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, Object, Object>> streamMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {

        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, Object, Object>> options =
                StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                        .builder()
                        .pollTimeout(Duration.ofSeconds(5))
                        .batchSize(2)
                        .serializer(RedisSerializer.string())
                        .hashKeySerializer(new StringRedisSerializer())
                        .hashValueSerializer(redisSerializer)
                        .build();

        StreamMessageListenerContainer<String, MapRecord<String, Object, Object>> container =
                StreamMessageListenerContainer.create(connectionFactory, options);

        container.receive(
                Consumer.from(
                        redisStreamInitializer.getConsumerResultGroup(),
                        "java-consumer-" + System.currentTimeMillis()
                ),
                StreamOffset.create(
                        redisStreamInitializer.getStreamResultName(),
                        ReadOffset.lastConsumed()
                ),
                redisStreamListener
        );

        log.info("Listener registrado para stream: {}",
                redisStreamInitializer.getStreamResultName());
        log.info("Consumer group: {}",
                redisStreamInitializer.getConsumerResultGroup());
        container.start();
        return container;
    }
}
