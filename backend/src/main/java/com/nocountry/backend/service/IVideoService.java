package com.nocountry.backend.service;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.model.User;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IVideoService {

    JobState processVideo(MultipartFile multipartFile, InstructionsVideo instructionsVideo,User user);

    JobState getVideoState(Long idJob, User user);

    ResponseEntity<ResourceRegion> streamVideo(Long videoOutputId, HttpHeaders headers, User user) throws IOException;
}
