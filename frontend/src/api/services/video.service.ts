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

  getStreamInputUrl(videoInputId: number): string {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    return `${base}${API_ENDPOINTS.VIDEOS.STREAM_INPUT(String(videoInputId))}`;
  },

  async downloadVideoOut(videoOutputId: number): Promise<void> {
    const response = await api.get(API_ENDPOINTS.VIDEOS.DOWNLOAD_OUTPUT(String(videoOutputId)), {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    const disposition: string = response.headers['content-disposition'] ?? '';
    const match = disposition.match(/filename="(.+)"/);
    a.href = url;
    a.download = match?.[1] ?? `short-${videoOutputId}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async downloadVideoIn(videoInputId: number): Promise<void> {
    const response = await api.get(API_ENDPOINTS.VIDEOS.DOWNLOAD_INPUT(String(videoInputId)), {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    const disposition: string = response.headers['content-disposition'] ?? '';
    const match = disposition.match(/filename="(.+)"/);
    a.href = url;
    a.download = match?.[1] ?? `video-${videoInputId}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteVideoOut(videoOutputId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.VIDEOS.DELETE_OUTPUT(String(videoOutputId)));
  },

  async deleteVideoIn(videoInputId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.VIDEOS.DELETE_INPUT(String(videoInputId)));
  },

  async reprocessVideo(videoInputId: number, instructions: InstructionsVideo): Promise<JobState> {
    const response = await api.post<JobState>(
      API_ENDPOINTS.VIDEOS.REPROCESS(String(videoInputId)),
      instructions,
    );
    return response.data;
  },

  async getProcessingJobs(): Promise<JobState[]> {
    const response = await api.get<JobState[]>(API_ENDPOINTS.VIDEOS.PROCESSING_JOBS);
    return response.data;
  },
};
