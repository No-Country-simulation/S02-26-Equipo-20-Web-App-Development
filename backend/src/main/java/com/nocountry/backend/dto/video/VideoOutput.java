package com.nocountry.backend.dto.video;

public record VideoOutput(
        String fileName,
        String path,
        Long durationSeconds,
        Long videoSizeBytes
) {
}
