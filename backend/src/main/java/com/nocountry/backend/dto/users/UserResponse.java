package com.nocountry.backend.dto.users;

public record UserResponse(
        Long id,
        String name,
        String lastname,
        String email,
        Long folderSizeBytes) {
}
