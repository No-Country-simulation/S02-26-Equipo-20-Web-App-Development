package com.nocountry.backend.service;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.dto.video.VideoInWithVideoOutIds;
import com.nocountry.backend.model.User;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IVideoService {

    JobState processVideo(MultipartFile multipartFile, InstructionsVideo instructionsVideo,User user);

    JobState reprocessVideo(Long videoInputId, InstructionsVideo instructionsVideo, User user);

    JobState getVideoState(Long idJob, User user);

    List<VideoInWithVideoOutIds> getAllVideos(User user);

    ResponseEntity<ResourceRegion> streamVideoOut(Long videoOutputId, HttpHeaders headers, User user) throws IOException;

    ResponseEntity<ResourceRegion> streamVideoIn(Long videoInputId, HttpHeaders headers, User user) throws IOException;

    ResponseEntity<Resource> downloadVideoOut(Long videoOutputId, User user) throws IOException;

    ResponseEntity<Resource> downloadVideoIn(Long videoInputId, User user) throws IOException;

    void deleteVideoIn(Long videoInputId, User user);

    void deleteVideoOut(Long videoOutputId, User user);

    List<JobState> getJobsProcessing(User user);
}
