package com.nocountry.backend.dto.video;

import java.util.List;

public record VideoInWithVideoOutIds(
        Long videoInId,
        String strategy,
        List<Long> videoOutIds
) {
}
