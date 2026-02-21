package com.nocountry.backend.dto.video;

import java.time.LocalDateTime;

public record VideoJob(
        String idJob,
        String videoPath,
        InstructionsVideo instructionsVideo,
        LocalDateTime timestamp) {
}

