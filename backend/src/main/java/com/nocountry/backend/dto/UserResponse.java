package com.nocountry.backend.dto;

public record UserResponse(
        Long id,
        String name,
        String lastname,
        String email,
        String country) {
}
