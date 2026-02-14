export type VideoStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface Short {
  id: string;
  videoId: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // en segundos
  title: string;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  originalUrl: string;
  thumbnailUrl: string;
  duration: number; // en segundos
  status: VideoStatus;
  uploadProgress?: number; // 0-100
  processingProgress?: number; // 0-100
  shorts: Short[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoUploadResponse {
  videoId: string;
  uploadUrl: string;
}

export interface VideoListResponse {
  videos: Video[];
  total: number;
  page: number;
  perPage: number;
}
