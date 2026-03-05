package com.nocountry.backend.service.impl;

import com.nocountry.backend.service.*;
import org.springframework.http.*;
import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.dto.video.VideoInWithVideoOutIds;
import com.nocountry.backend.dto.video.VideoJob;
import com.nocountry.backend.exception.VideoException;
import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoIn;
import com.nocountry.backend.model.VideoOut;
import com.nocountry.backend.model.VideoState;
import com.nocountry.backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoServiceImpl implements IVideoService {

    private static final long CHUNK_SIZE = 1024L * 1024L;

    private final IVideoOutService videoOutService;
    private final IVideoInService videoInService;
    private final IVideoStorage videoStorage;
    private final IUserRepository userRepository;
    private final RedisStreamPublisher redisStreamPublisher;
    private final ObjectMapper objectMapper;

    @Transactional
    @Override
    public JobState processVideo(
            MultipartFile multipartFile,
            InstructionsVideo instructionsVideo,
            User user) {

        String videoPath = videoStorage.saveVideo(multipartFile, user);
        VideoIn videoIn = new VideoIn();
        videoIn.setUser(user);
        videoIn.setPath(videoPath);
        videoIn.setName(multipartFile.getOriginalFilename());
        videoIn.setVideoInstructions(
                objectMapper.writeValueAsString(instructionsVideo));
        videoIn.setVideoState(VideoState.UPLOADED);
        videoIn.setVideoSize(multipartFile.getSize());
        VideoIn videoInSaved = videoInService.saveVideo(videoIn);
        userRepository.incrementFolderSize(
                user.getId(),
                multipartFile.getSize()
        );
        VideoJob videoJob = new VideoJob(
                videoInSaved.getId().toString(),
                videoPath,
                instructionsVideo,
                LocalDateTime.now()
        );
        redisStreamPublisher.publishJob(videoJob);
        videoInSaved.setVideoState(VideoState.PROCESSING);
        return new JobState(
                videoInSaved.getId(),
                videoInSaved.getVideoState(),
                null
        );
    }

    @Transactional
    @Override
    public JobState reprocessVideo(Long videoInputId, InstructionsVideo instructionsVideo, User user) {
        VideoIn originalVideo = videoInService.getVideoInByIdAndUserId(videoInputId, user.getId());
        VideoIn newVideo = new VideoIn();
        newVideo.setUser(originalVideo.getUser());
        newVideo.setPath(originalVideo.getPath());
        newVideo.setName(originalVideo.getName());
        newVideo.setDuration(originalVideo.getDuration());
        newVideo.setVideoSize(originalVideo.getVideoSize());
        newVideo.setVideoInstructions(
                objectMapper.writeValueAsString(instructionsVideo)
        );
        newVideo.setVideoState(VideoState.PROCESSING);
        VideoIn savedVideo = videoInService.saveVideo(newVideo);
        VideoJob videoJob = new VideoJob(
                savedVideo.getId().toString(),
                savedVideo.getPath(),
                instructionsVideo,
                LocalDateTime.now()
        );
        redisStreamPublisher.publishJob(videoJob);
        return new JobState(
                savedVideo.getId(),
                savedVideo.getVideoState(),
                null
        );
    }

    @Override
    @Transactional(readOnly = true)
    public JobState getVideoState(Long idJob, User user) {
        VideoIn videoIn = videoInService.getVideoInByIdAndUserId(idJob, user.getId());
        if (videoIn.getVideoState() == VideoState.COMPLETED) {
            return new JobState(idJob,
                    videoIn.getVideoState(),
                    videoIn.getVideoOuts().stream().map(VideoOut::getId).toList());
        } else {
            return new JobState(idJob, videoIn.getVideoState(), null);
        }
    }

    @Override
    public ResponseEntity<ResourceRegion> streamVideoOut(Long videoOutputId, HttpHeaders headers, User user) throws IOException {
        Path path = videoOutService.getVideoOutPathById(videoOutputId, user);
        return streamVideo(path, headers);
    }

    @Override
    public ResponseEntity<ResourceRegion> streamVideoIn(Long videoInputId, HttpHeaders headers, User user) throws IOException {
        Path path = videoInService.getVideoInPathById(videoInputId, user);
        return streamVideo(path, headers);
    }

    @Override
    public List<VideoInWithVideoOutIds> getAllVideos(User user) {

        List<Object[]> rows = videoInService.getVideoInIdAndVideoOutIdByUser(user.getId());

        Map<Long, VideoInWithVideoOutIds> grouped = new LinkedHashMap<>();

        for (Object[] row : rows) {
            Long videoInId = (Long) row[0];
            Long videoOutId = (Long) row[1];
            String strategyJson = (String) row[2];

            grouped.computeIfAbsent(videoInId, id ->
                    new VideoInWithVideoOutIds(
                            id,
                            generateStrategy(strategyJson),
                            new ArrayList<>()
                    )
            ).videoOutIds().add(videoOutId);
        }

        return new ArrayList<>(grouped.values());
    }

    private String generateStrategy(String strategy) {
        InstructionsVideo iv = objectMapper.readValue(strategy, InstructionsVideo.class);
        String result;
        if (iv.withSceneDetector() != null && iv.withSceneDetector()) {
            result = "SceneDetector min: " + iv.minSceneDuration() + " max: " + iv.maxSceneDuration();
        } else if (iv.chooseTimes() != null && iv.chooseTimes()) {
            result = "ChooseTimes " + (iv.joinTimes() != null && iv.joinTimes() ? "join" : "") + " " + iv.vectorTimes();
        } else {
            result = "Segments: " + iv.numberOfSegments();
        }

        return result;
    }

    @Override
    public ResponseEntity<Resource> downloadVideoOut(Long videoOutputId, User user) throws IOException {
        Path path = videoOutService.getVideoOutPathById(videoOutputId, user);
        return buildDownloadResponse(path);
    }

    @Override
    public ResponseEntity<Resource> downloadVideoIn(Long videoInputId, User user) throws IOException {
        Path path = videoInService.getVideoInPathById(videoInputId, user);
        return buildDownloadResponse(path);
    }

    private ResponseEntity<Resource> buildDownloadResponse(Path path) throws IOException {
        UrlResource video = new UrlResource(path.toUri());
        if (!video.exists()) {
            throw new FileNotFoundException("Video not found");
        }
        String filename = path.getFileName().toString();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(video);
    }

    @Transactional
    @Override
    public void deleteVideoIn(Long videoInputId, User user) {
        VideoIn videoIn = videoInService.getVideoInByIdAndUserId(videoInputId, user.getId());
        boolean isProcessing = videoInService.verifyVideoInIsProcessing(videoIn.getPath(), VideoState.PROCESSING);
        if (isProcessing) {
            throw new VideoException("Video is still processing");
        }
        videoStorage.deleteVideoIn(videoIn.getPath());
        userRepository.decreaseFolderSize(user.getId(), videoIn.getVideoSize());
        videoInService.updateVideoInDelete(videoIn.getPath());
    }

    @Transactional
    @Override
    public void deleteVideoOut(Long videoOutputId, User user) {
        VideoOut videoOut = videoOutService.getVideoOutByIdAndUserId(videoOutputId, user.getId());
        videoStorage.deleteVideoOut(videoOut.getPath());
        userRepository.decreaseFolderSize(user.getId(), videoOut.getVideoSizeBytes());
        videoOut.setDeleted(true);
        videoOutService.saveVideo(videoOut);
    }

    @Override
    public List<JobState> getJobsProcessing(User user) {
        return videoInService.getAllVideosWithStateProcessing(user, VideoState.PROCESSING);
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

    private ResponseEntity<ResourceRegion> streamVideo(Path path, HttpHeaders headers) throws IOException {
        UrlResource video = new UrlResource(path.toUri());
        if (!video.exists()) {
            throw new FileNotFoundException("Video not found");
        }
        long contentLength = video.contentLength();
        ResourceRegion region = buildRegion(video, headers, contentLength);
        return ResponseEntity
                .status(HttpStatus.PARTIAL_CONTENT)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .contentType(MediaType.parseMediaType("video/mp4"))
                .body(region);
    }
}