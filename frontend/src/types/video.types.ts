// GET /video/all
export interface VideoInWithVideoOutIds {
  videoInId: number;
  videoOutIds: number[];
}

// GET /video/job-status/{id} y POST /video/process-video
export type VideoState = 'UPLOADED' | 'PROCESSING' | 'FAILED' | 'COMPLETED';

export interface JobState {
  idJob: number;
  state: VideoState;
  videoOutputsResultIds: number[] | null;
}

// Body de POST /video/process-video
export interface InstructionsVideo {
  withSceneDetector: boolean;
  isFollowFace: boolean;
  minSceneDuration: number;
  maxSceneDuration: number;
  numberOfSegments: number;
  vectorTimes?: string;
}
