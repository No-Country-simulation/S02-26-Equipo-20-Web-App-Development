package com.nocountry.backend.dto.video;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InstructionsVideo(
        Boolean withSceneDetector,
        Boolean isFollowFace,
        @Min(5)
        Integer minSceneDuration,
        @Min(5)
        Integer maxSceneDuration,
        @Min(1)
        Integer numberOfSegments,
        String vectorTimes){
}
