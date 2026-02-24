package com.nocountry.backend.service;

import com.nocountry.backend.dto.video.VideoOutput;
import com.nocountry.backend.dto.video.VideoOutputResults;
import com.nocountry.backend.model.VideoIn;
import com.nocountry.backend.model.VideoOut;
import com.nocountry.backend.model.VideoState;
import com.nocountry.backend.repository.IUserRepository;
import com.nocountry.backend.repository.IVideoInRepository;
import com.nocountry.backend.repository.IVideoOutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStreamListener implements StreamListener<String, MapRecord<String, Object, Object>> {

    private final StringRedisTemplate stringRedisTemplate;
    private final IVideoOutRepository videoOutRepository;
    private final IVideoInRepository videoInRepository;
    private final IUserRepository userRepository;
    private final RedisStreamInitializer redisStreamInitializer;
    private final ObjectMapper objectMapper;

    @Transactional
    @Override
    public void onMessage(MapRecord<String, Object, Object> message) {
        try {
            Object payloadObject = message.getValue().get("payload");
            if (payloadObject == null) {
                acknowledgeMessage(message);
                log.warn("No hay payload en el mensaje");
                return;
            }
            VideoOutputResults videoOutputResults = objectMapper.convertValue(payloadObject, VideoOutputResults.class);

            log.info("Resultado procesado recibido:");
            log.info("   Job ID: {}", videoOutputResults.idJob());
            log.info("   Estado: {}", videoOutputResults.state());
            VideoIn videoIn = videoInRepository.findById(Long.parseLong(videoOutputResults.idJob())).orElseThrow();
            videoIn.setDuration(videoOutputResults.baseVideoDurationSeconds());
            if (videoOutputResults.state().equals("done")){
                List<VideoOut> videoOuts = videoOutputResults.videos().stream().map(
                        videoOutput -> new VideoOut(
                                videoIn,
                                videoOutput.path(),
                                videoOutput.fileName(),
                                videoOutput.durationSeconds(),
                                videoOutput.videoSizeBytes())
                ).toList();
                videoOutRepository.saveAll(videoOuts);
                videoIn.setVideoState(VideoState.COMPLETED);
                log.info("   Archivos generados: {}", videoOutputResults.videos().size());
            }else {
                videoIn.setVideoState(VideoState.FAILED);
            }
            videoInRepository.save(videoIn);

            long totalSize = videoOutputResults.videos()
                    .stream()
                    .mapToLong(VideoOutput::videoSizeBytes)
                    .sum();

            userRepository.incrementFolderSize(
                    videoIn.getUser().getId(),
                    totalSize
            );

            acknowledgeMessage(message);
            deleteMessage(message);

        } catch (Exception e) {
            log.error("Error al leer payload del mensaje: {}", e.getMessage());
        }
    }

    private void acknowledgeMessage(MapRecord<String, Object, Object> message) {
        try {

            stringRedisTemplate.opsForStream()
                    .acknowledge(redisStreamInitializer.getStreamResultName(),
                            redisStreamInitializer.getConsumerResultGroup(),
                            message.getId());

            log.debug("ACK enviado para mensaje: {}", message.getId());

        } catch (Exception e) {
            log.error("Error haciendo ACK: {}", e.getMessage());
        }
    }

    private void deleteMessage(MapRecord<String, Object, Object> message) {
        try {
            stringRedisTemplate.opsForStream()
                    .delete(Objects.requireNonNull(message.getStream()), message.getId());

            log.debug("Mensaje eliminado del stream: {}", message.getId());

        } catch (Exception e) {
            log.error("Error eliminando mensaje: {}", e.getMessage());
        }
    }
}

