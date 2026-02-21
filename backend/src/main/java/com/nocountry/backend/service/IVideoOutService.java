package com.nocountry.backend.service;

import com.nocountry.backend.model.User;

import java.nio.file.Path;

public interface IVideoOutService {

    Path getVideoOutPathById(Long videoOutputId, User user);
}
