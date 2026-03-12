import type { InstructionsVideo } from '@/types/video.types';

export const DEFAULT_INSTRUCTIONS: InstructionsVideo = {
  withSceneDetector: false,
  chooseTimes: false,
  joinTimes: false,
  isFollowFace: false,
  minSceneDuration: 5,
  maxSceneDuration: 60,
  numberOfSegments: 3,
  vectorTimes: undefined,
};
