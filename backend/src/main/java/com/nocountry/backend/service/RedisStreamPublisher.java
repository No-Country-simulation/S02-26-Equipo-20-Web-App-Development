package com.nocountry.backend.service;

import com.nocountry.backend.dto.video.VideoJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisStreamCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStreamPublisher {

    @Value("${redis.stream.job.max-length}")
    private Long maxStreamLength;

    private final RedisStreamInitializer redisStreamInitializer;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public boolean publishJob(VideoJob videoJob) {
        try {
            String jobJson = objectMapper.writeValueAsString(videoJob);
            Map<String, String> jobMap = Map.of("payload", jobJson);
            RedisStreamCommands.XAddOptions options = RedisStreamCommands.XAddOptions
                    .maxlen(maxStreamLength)
                    .approximateTrimming(true);

            stringRedisTemplate.opsForStream().add(
                    redisStreamInitializer.getStreamJobName(),
                    jobMap,
                    options
            );
            log.info("Job {} publicado en el stream '{}'", videoJob.idJob(),redisStreamInitializer.getStreamJobName());
            return true;
        } catch (Exception _) {
            log.error("Error publicando job en el stream '{}'", redisStreamInitializer.getStreamJobName());
            return false;
        }

    }

}

