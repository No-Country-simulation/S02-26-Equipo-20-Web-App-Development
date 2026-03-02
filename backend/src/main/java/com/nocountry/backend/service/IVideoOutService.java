package com.nocountry.backend.service;

import com.nocountry.backend.model.User;
import com.nocountry.backend.model.VideoOut;

import java.nio.file.Path;

public interface IVideoOutService {

    Path getVideoOutPathById(Long videoOutputId, User user);

    VideoOut getVideoOutByIdAndUserId(Long videoOutputId, Long id);

    void saveVideo(VideoOut videoOut);
}
