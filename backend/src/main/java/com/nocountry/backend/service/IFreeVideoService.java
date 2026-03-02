package com.nocountry.backend.service;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface IFreeVideoService {
    JobState processVideo(MultipartFile file, InstructionsVideo instructions);

    JobState getVideoState(Long idJob);

    ResponseEntity<ResourceRegion> streamVideo(Long videoOutputId, HttpHeaders headers);

    ResponseEntity<Resource> downloadVideo(Long videoOutputId);
}
