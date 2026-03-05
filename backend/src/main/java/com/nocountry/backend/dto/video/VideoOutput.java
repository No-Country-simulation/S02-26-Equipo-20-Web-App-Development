package com.nocountry.backend.dto.video;

public record VideoOutput(
        String fileName,
        String path,
        Integer durationSeconds,
        Long videoSizeBytes
) {
}
