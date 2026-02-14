import type { Video, Short } from '@/types/video.types';

// Mock shorts
const mockShorts: Record<string, Short[]> = {
  '1': [
    {
      id: 's1-1',
      videoId: '1',
      url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
      duration: 15,
      title: 'Short 1 - Intro',
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 's1-2',
      videoId: '1',
      url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      duration: 12,
      title: 'Short 2 - Highlights',
      createdAt: '2026-02-10T10:01:00Z',
    },
    {
      id: 's1-3',
      videoId: '1',
      url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
      duration: 18,
      title: 'Short 3 - Final',
      createdAt: '2026-02-10T10:02:00Z',
    },
  ],
  '2': [
    {
      id: 's2-1',
      videoId: '2',
      url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
      duration: 14,
      title: 'Short 1 - Tutorial Intro',
      createdAt: '2026-02-09T14:00:00Z',
    },
  ],
};

// Mock videos
export const mockVideos: Video[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Mi primer video horizontal - Tutorial de React',
    originalUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    duration: 180, // 3 minutos
    status: 'completed',
    shorts: mockShorts['1'],
    createdAt: '2026-02-10T09:30:00Z',
    updatedAt: '2026-02-10T09:35:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Tutorial de TypeScript - Parte 1',
    originalUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
    duration: 240,
    status: 'completed',
    shorts: mockShorts['2'],
    createdAt: '2026-02-09T14:00:00Z',
    updatedAt: '2026-02-09T14:05:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Video en procesamiento - Spring Boot Tutorial',
    originalUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    duration: 300,
    status: 'processing',
    processingProgress: 65,
    shorts: [],
    createdAt: '2026-02-14T08:00:00Z',
    updatedAt: '2026-02-14T08:03:00Z',
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Video con error - Failed Processing',
    originalUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    duration: 120,
    status: 'failed',
    shorts: [],
    createdAt: '2026-02-13T16:00:00Z',
    updatedAt: '2026-02-13T16:02:00Z',
  },
];

// Helper para simular delay de API
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simular carga de videos
export async function fetchMockVideos(): Promise<Video[]> {
  await delay(800); // Simular latencia de red
  return mockVideos;
}

// Simular carga de un video específico
export async function fetchMockVideo(id: string): Promise<Video | null> {
  await delay(500);
  return mockVideos.find((v) => v.id === id) || null;
}

// Simular carga de shorts de un video
export async function fetchMockShorts(videoId: string): Promise<Short[]> {
  await delay(500);
  return mockShorts[videoId] || [];
}

// Simular subida de video con progreso
export async function uploadMockVideo(
  file: File,
  onProgress: (progress: number) => void,
): Promise<Video> {
  // Simular progreso de subida
  for (let i = 0; i <= 100; i += 10) {
    await delay(200);
    onProgress(i);
  }

  // Crear mock video
  const newVideo: Video = {
    id: `video-${Date.now()}`,
    userId: 'user1',
    title: file.name.replace(/\.[^/.]+$/, ''),
    originalUrl: URL.createObjectURL(file),
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    duration: 0,
    status: 'uploading',
    uploadProgress: 100,
    shorts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newVideo;
}
