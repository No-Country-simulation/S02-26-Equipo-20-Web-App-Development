package com.nocountry.backend.service;

import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoIn;
import com.nocountry.backend.model.VideoState;

import java.nio.file.Path;
import java.util.List;

public interface IVideoInService {

    Path getVideoInPathById(Long videoInputId, User user);

    VideoIn saveVideo(VideoIn videoIn);

    VideoIn getVideoInByIdAndUserId(Long videoInputId, Long id);

    List<Object[]> getVideoInIdAndVideoOutIdByUser(Long id);

    void updateVideoInDelete(String path);

    boolean verifyVideoInIsProcessing(String path, VideoState videoState);
}
