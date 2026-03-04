package com.nocountry.backend.dto.video;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nocountry.backend.validations.ValidVectorTimes;
import com.nocountry.backend.validations.VectorTimesValidator;
import jakarta.validation.constraints.Min;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InstructionsVideo(
        Boolean withSceneDetector,
        Boolean chooseTimes,
        Boolean joinTimes,
        Boolean isFollowFace,
        @Min(5)
        Integer minSceneDuration,
        @Min(5)
        Integer maxSceneDuration,
        @Min(1)
        Integer numberOfSegments,
        @ValidVectorTimes
        String vectorTimes
) {
        public InstructionsVideo {
                String normalized = VectorTimesValidator.normalizeVectorTimes(vectorTimes);

                if (Boolean.TRUE.equals(joinTimes) && normalized != null) {
                        normalized = mergeOverlappingIntervals(normalized);
                }

                vectorTimes = normalized;
        }

        private static String mergeOverlappingIntervals(String normalized) {
                List<long[]> intervals = new ArrayList<>();
                for (String segment : normalized.split(",")) {
                        String[] parts = segment.trim().split("-");
                        intervals.add(new long[]{ Long.parseLong(parts[0]), Long.parseLong(parts[1]) });
                }

                intervals.sort(Comparator.comparingLong(a -> a[0]));

                List<long[]> merged = new ArrayList<>();
                long[] current = intervals.getFirst();

                for (int i = 1; i < intervals.size(); i++) {
                        long[] next = intervals.get(i);

                        if (next[0] <= current[1]) {
                                current[1] = Math.max(current[1], next[1]);
                        } else {
                                merged.add(current);
                                current = next;
                        }
                }
                merged.add(current);

                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < merged.size(); i++) {
                        if (i > 0) sb.append(",");
                        sb.append(merged.get(i)[0]).append("-").append(merged.get(i)[1]);
                }
                return sb.toString();
        }
}
