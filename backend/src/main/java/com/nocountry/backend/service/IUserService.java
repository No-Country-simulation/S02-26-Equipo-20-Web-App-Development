package com.nocountry.backend.service;

import com.nocountry.backend.dto.users.UpdateProfileRequest;
import com.nocountry.backend.dto.users.UserResponse;

public interface IUserService {
    UserResponse updateProfile(Long id, UpdateProfileRequest updateProfileRequest);
}
