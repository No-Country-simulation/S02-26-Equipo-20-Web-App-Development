package com.nocountry.backend.controller;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.dto.video.VideoInWithVideoOutIds;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IVideoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/video")
@RequiredArgsConstructor
@Validated
public class VideoController {

    private final IVideoService videoService;

    @PostMapping(value = "/process-video",consumes = "multipart/form-data")
    public ResponseEntity<JobState> uploadVideo(
            @RequestPart("file") MultipartFile file,
            @RequestPart("instructions") @Valid InstructionsVideo instructions,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.processVideo(file,instructions,user));
    }

    @GetMapping("/job-status/{idJob}")
    public ResponseEntity<JobState> getJobStatus(@PathVariable("idJob") @Min(1) Long idJob,@AuthenticationPrincipal User user){
        return ResponseEntity.ok(videoService.getVideoState(idJob,user));
    }

    @GetMapping("/output/{videoOutputId}")
    public ResponseEntity<ResourceRegion> streamVideo(
            @PathVariable Long videoOutputId,
            @RequestHeader HttpHeaders headers,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.streamVideo(videoOutputId, headers, user);
    }

    @GetMapping("/all")
    public ResponseEntity<List<VideoInWithVideoOutIds>> getAllVideos(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(videoService.getAllVideos(user));
    }
}
