export interface VideoInWithVideoOutIds {
  videoInId: number;
  strategy: string;
  videoOutIds: number[];
}

export type VideoState = 'UPLOADED' | 'PROCESSING' | 'FAILED' | 'COMPLETED';

export interface JobState {
  idJob: number;
  state: VideoState;
  videoOutputsResultIds: number[] | null;
}

export interface InstructionsVideo {
  withSceneDetector: boolean;
  chooseTimes?: boolean;
  joinTimes?: boolean;
  isFollowFace: boolean;
  minSceneDuration: number;
  maxSceneDuration: number;
  numberOfSegments: number;
  vectorTimes?: string;
}
