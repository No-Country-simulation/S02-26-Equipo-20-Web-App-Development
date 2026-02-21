package com.nocountry.backend.dto.video;

import com.nocountry.backend.model.VideoState;

import java.util.List;

public record JobState(Long idJob, VideoState state , List<Long> VideoOutputsResultIds) {
}
