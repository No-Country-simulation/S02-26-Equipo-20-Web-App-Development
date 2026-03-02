package com.nocountry.backend.service;

import com.nocountry.backend.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface IVideoStorage {
    String saveVideo(MultipartFile multipartFile, User user);

    Long getFolderSizeBytes(User user);

    void deleteVideoIn(String path);

    void deleteVideoOut(String path);
}
