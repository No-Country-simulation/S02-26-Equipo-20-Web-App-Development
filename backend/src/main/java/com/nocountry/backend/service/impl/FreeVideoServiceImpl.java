package com.nocountry.backend.service.impl;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.service.IFreeVideoService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FreeVideoServiceImpl implements IFreeVideoService {
    @Override
    public JobState processVideo(MultipartFile file, InstructionsVideo instructions) {
        return null;
    }

    @Override
    public JobState getVideoState(Long idJob) {
        return null;
    }

    @Override
    public ResponseEntity<ResourceRegion> streamVideo(Long videoOutputId, HttpHeaders headers) {
        return null;
    }

    @Override
    public ResponseEntity<Resource> downloadVideo(Long videoOutputId) {
        return null;
    }
}
