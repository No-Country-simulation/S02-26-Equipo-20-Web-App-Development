import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { VideoUpload } from '@/components/features/VideoUpload';
import { VideoList } from '@/components/features/VideoList';
import { fetchMockVideos, uploadMockVideo } from '@/mocks/videos.mock';
import type { Video } from '@/types/video.types';
import { toast } from 'sonner';

type TabType = 'all' | 'processing' | 'completed';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Cargar videos al montar
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockVideos();
      setVideos(data);
    } catch (error) {
      console.log(error);
      toast.error('Error al cargar videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newVideo = await uploadMockVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      setVideos((prev) => [newVideo, ...prev]);
      toast.success('¡Video subido exitosamente!');
      setShowUploadModal(false);

      // Simular cambio de estado a processing después de 2s
      setTimeout(() => {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === newVideo.id ? { ...v, status: 'processing', processingProgress: 0 } : v,
          ),
        );

        // Simular progreso de procesamiento
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress > 100) {
            clearInterval(interval);
            // Cambiar a completed
            setVideos((prev) =>
              prev.map((v) =>
                v.id === newVideo.id
                  ? {
                      ...v,
                      status: 'completed',
                      processingProgress: 100,
                      shorts: [
                        {
                          id: `s-${newVideo.id}-1`,
                          videoId: newVideo.id,
                          url: newVideo.originalUrl,
                          thumbnailUrl: newVideo.thumbnailUrl,
                          duration: 15,
                          title: 'Short generado 1',
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }
                  : v,
              ),
            );
            toast.success('¡Video procesado! Tus shorts están listos');
          } else {
            setVideos((prev) =>
              prev.map((v) => (v.id === newVideo.id ? { ...v, processingProgress: progress } : v)),
            );
          }
        }, 500);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error('Error al subir video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    toast.success('Video eliminado');
  };

  // Filtrar videos según tab
  const filteredVideos = videos.filter((video) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing')
      return video.status === 'processing' || video.status === 'uploading';
    if (activeTab === 'completed') return video.status === 'completed';
    return true;
  });

  // Stats
  const stats = {
    total: videos.length,
    processing: videos.filter((v) => v.status === 'processing' || v.status === 'uploading').length,
    completed: videos.filter((v) => v.status === 'completed').length,
    totalShorts: videos.reduce((acc, v) => acc + v.shorts.length, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">¡Hola, {user?.name}! 👋</h1>
          <p className="text-gray-600">Gestiona tus videos y shorts aquí</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total videos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Shorts generados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShorts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-100 p-3">
                <svg
                  className="h-6 w-6 animate-spin text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Procesando</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <Button variant="primary" onClick={() => setShowUploadModal(true)} className="gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Subir nuevo video
          </Button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Subir video</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <VideoUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            {[
              { id: 'all', label: 'Todos', count: stats.total },
              { id: 'processing', label: 'Procesando', count: stats.processing },
              { id: 'completed', label: 'Completados', count: stats.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                } `}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Video List */}
        <VideoList videos={filteredVideos} isLoading={isLoading} onDelete={handleDelete} />
      </div>
    </div>
  );
}
