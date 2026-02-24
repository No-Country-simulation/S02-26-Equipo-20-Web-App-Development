package com.nocountry.backend.mapper;

import com.nocountry.backend.dto.users.UserResponse;
import com.nocountry.backend.model.User;

public class UserMapper {
    private UserMapper() {
    }

    public static UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getLastname(),
                user.getEmail(),
                user.getUserFolderSize());
    }
}
