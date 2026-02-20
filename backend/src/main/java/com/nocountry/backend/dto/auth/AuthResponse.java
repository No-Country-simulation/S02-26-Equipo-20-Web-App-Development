package com.nocountry.backend.dto.auth;

import com.nocountry.backend.dto.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user) {
}