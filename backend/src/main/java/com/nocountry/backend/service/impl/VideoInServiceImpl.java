package com.nocountry.backend.service.impl;

import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.exception.VideoException;
import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoIn;
import com.nocountry.backend.model.VideoState;
import com.nocountry.backend.repository.IVideoInRepository;
import com.nocountry.backend.service.IVideoInService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoInServiceImpl implements IVideoInService {

    private final IVideoInRepository videoInRepository;

    @Value("${video.storage.path}")
    private String storagePath;

    @Override
    public Path getVideoInPathById(Long videoInputId, User user) {
        VideoIn videoIn = videoInRepository
                .findByIdAndUserIdAndDeletedFalse(
                        videoInputId,
                        user.getId()
                )
                .orElseThrow(() ->
                        new VideoException("Video input not found"));

        Path videoPath = Paths.get(videoIn.getPath())
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

    @Override
    public VideoIn saveVideo(VideoIn videoIn) {
        return videoInRepository.save(videoIn);
    }

    @Override
    public VideoIn getVideoInByIdAndUserId(Long videoInputId, Long id) {
        return videoInRepository
                .findByIdAndUserIdAndDeletedFalse(videoInputId, id)
                .orElseThrow(() -> new VideoException("Video not found"));
    }

    @Override
    public List<Object[]> getVideoInIdAndVideoOutIdByUser(Long id) {
        return videoInRepository.findVideoInIdAndVideoOutIdByUser(id);
    }

    @Override
    public void updateVideoInDelete(String path) {
        videoInRepository.updateVideoInDeletedToTrue(path);
    }

    @Override
    public boolean verifyVideoInIsProcessing(String path, VideoState videoState) {
        return videoInRepository.existsByPathAndDeletedFalseAndVideoState(path,videoState);
    }

    @Override
    public List<JobState> getAllVideosWithStateProcessing(User user, VideoState videoState) {
        return videoInRepository.findAllByUserAndVideoState(user,videoState)
                .stream()
                .map(videoIn -> new JobState(videoIn.getId(), videoIn.getVideoState(),null))
                .toList();
    }
}
