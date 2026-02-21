package com.nocountry.backend.service.impl;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.dto.video.VideoJob;
import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoIn;
import com.nocountry.backend.model.VideoOut;
import com.nocountry.backend.model.VideoState;
import com.nocountry.backend.repository.IVideoInRepository;
import com.nocountry.backend.service.IVideoOutService;
import com.nocountry.backend.service.IVideoService;
import com.nocountry.backend.service.IVideoStorage;
import com.nocountry.backend.service.RedisStreamPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoServiceImpl implements IVideoService {

    private static final long CHUNK_SIZE = 1024L * 1024L;

    private final IVideoOutService videoOutService;
    private final IVideoInRepository videoInRepository;
    private final IVideoStorage videoStore;
    private final RedisStreamPublisher redisStreamPublisher;
    private final ObjectMapper objectMapper;

    @Override
    public JobState processVideo(MultipartFile multipartFile, InstructionsVideo instructionsVideo, User user) {
        String videoPath = videoStore.saveVideo(multipartFile, user);
        VideoIn videoIn = new VideoIn();
        videoIn.setUser(user);
        videoIn.setPath(videoPath);
        videoIn.setName(multipartFile.getOriginalFilename());
        videoIn.setVideoInstructions(objectMapper.writeValueAsString(instructionsVideo));
        videoIn.setVideoState(VideoState.START);
        videoIn.setVideoSize(multipartFile.getSize());

        VideoIn videoInSaved = videoInRepository.save(videoIn);

        VideoJob videoJob = new VideoJob(videoIn.getId().toString(), videoPath, instructionsVideo, LocalDateTime.now());

        redisStreamPublisher.publishJob(videoJob);

        videoInSaved.setVideoState(VideoState.PROCESSING);

        videoInRepository.save(videoInSaved);
        return new JobState(videoIn.getId(), videoIn.getVideoState(), null);
    }

    @Override
    @Transactional(readOnly = true)
    public JobState getVideoState(Long idJob, User user) {
        VideoIn videoIn = videoInRepository
                .findByIdAndUserIdAndDeletedFalse(idJob, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));
        if (videoIn.getVideoState() == VideoState.FINISHED){
            return new JobState(idJob,
                    videoIn.getVideoState(),
                    videoIn.getVideoOuts().stream().map(VideoOut::getId).toList());
        }else {
            return new JobState(idJob,videoIn.getVideoState(),null);
        }
    }

    @Override
    public ResponseEntity<ResourceRegion> streamVideo(Long videoOutputId, HttpHeaders headers, User user) throws IOException {
        Path path = videoOutService.getVideoOutPathById(videoOutputId, user);

        UrlResource video = new UrlResource(path.toUri());

        if (!video.exists()) {
            throw new FileNotFoundException("Video not found");
        }

        long contentLength = video.contentLength();

        ResourceRegion region = buildRegion(video, headers, contentLength);

        return ResponseEntity
                .status(HttpStatus.PARTIAL_CONTENT)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .contentType(MediaTypeFactory
                        .getMediaType(video)
                        .orElse(MediaType.APPLICATION_OCTET_STREAM))
                .body(region);
    }

    private ResourceRegion buildRegion(
            UrlResource video,
            HttpHeaders headers,
            long contentLength) {

        if (headers.getRange().isEmpty()) {
            return new ResourceRegion(
                    video,
                    0,
                    Math.min(CHUNK_SIZE, contentLength));
        }

        HttpRange range = headers.getRange().getFirst();

        long start = range.getRangeStart(contentLength);
        long end = range.getRangeEnd(contentLength);

        long rangeLength =
                Math.min(CHUNK_SIZE, end - start + 1);

        return new ResourceRegion(video, start, rangeLength);
    }
}
