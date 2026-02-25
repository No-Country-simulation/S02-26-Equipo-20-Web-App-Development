package com.nocountry.backend.service.impl;

import com.nocountry.backend.exception.VideoException;
import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoOut;
import com.nocountry.backend.repository.IVideoOutRepository;
import com.nocountry.backend.service.IVideoOutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoOutServiceImpl implements IVideoOutService {

    private final IVideoOutRepository videoOutRepository;

    @Value("${video.storage.path}")
    private String storagePath;

    @Override
    public Path getVideoOutPathById(Long videoOutputId, User user) {

        VideoOut videoOut = videoOutRepository
                .findByIdAndVideoInUserIdAndDeletedFalse(
                        videoOutputId,
                        user.getId()
                )
                .orElseThrow(() ->
                        new VideoException("Video output not found"));

        Path videoPath = Paths.get(videoOut.getPath())
                .toAbsolutePath()
                .normalize();

        Path userBasePath = Paths.get(storagePath)
                .resolve(user.getUserFolderName())
                .toAbsolutePath()
                .normalize();

        if (!videoPath.startsWith(userBasePath)) {
            throw new SecurityException("Invalid video path");
        }
        return videoPath;
    }
}
