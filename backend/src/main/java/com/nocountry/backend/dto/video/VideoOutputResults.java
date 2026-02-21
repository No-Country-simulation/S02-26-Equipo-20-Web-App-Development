package com.nocountry.backend.dto.video;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record VideoOutputResults(
        String idJob,
        Long baseVideoDurationSeconds,
        String state,
        List<VideoOutput> videos,
        LocalDateTime timestamp
) {
}
