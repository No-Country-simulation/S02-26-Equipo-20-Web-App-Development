package com.nocountry.backend.dto.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateProfileRequest(
        @NotBlank String name,
        @NotBlank String lastname
) {
}
