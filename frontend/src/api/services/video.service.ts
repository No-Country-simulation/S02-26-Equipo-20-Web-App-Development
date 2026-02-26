import type { InstructionsVideo, JobState, VideoInWithVideoOutIds } from '@/types/video.types';
import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const videoService = {
  async uploadVideo(
    file: File,
    instructions: InstructionsVideo,
    onProgress?: (progress: number) => void,
  ): Promise<JobState> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'instructions',
      new Blob([JSON.stringify(instructions)], { type: 'application/json' }),
    );

    const response = await api.post<JobState>(API_ENDPOINTS.VIDEOS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });

    return response.data;
  },

  async getJobStatus(idJob: number): Promise<JobState> {
    const response = await api.get<JobState>(API_ENDPOINTS.VIDEOS.STATUS(String(idJob)));
    return response.data;
  },

  async getAllVideos(): Promise<VideoInWithVideoOutIds[]> {
    const response = await api.get<VideoInWithVideoOutIds[]>(API_ENDPOINTS.VIDEOS.ALL);
    return response.data;
  },

  getStreamUrl(videoOutputId: number): string {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    return `${base}${API_ENDPOINTS.VIDEOS.STREAM(String(videoOutputId))}`;
  },
};
