import { useState } from 'react';
import { Download, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { videoService } from '@/api/services/video.service';
import { useDeleteShort } from '@/hooks/useDeleteShort';
import { toast } from 'sonner';

interface ShortCardProps {
  videoOutputId: number;
  index: number;
}

export function ShortCard({ videoOutputId, index }: ShortCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: deleteShort, isPending: isDeleting } = useDeleteShort();

  const streamUrl = videoService.getStreamUrl(videoOutputId);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await videoService.downloadVideoOut(videoOutputId);
    } catch {
      toast.error('Error al descargar el short');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    deleteShort(videoOutputId, {
      onSuccess: () => {
        setConfirmDelete(false);
        setShowModal(false);
      },
    });
  };

  const modalHeader = (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm font-medium text-white">Short #{index + 1}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-1.5 border-white/30 text-white hover:bg-white/10">
          <Download className="h-4 w-4" />
          {isDownloading ? 'Descargando...' : 'Descargar'}
        </Button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-red-400"
          title="Eliminar short">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
        <div
          className="relative aspect-9/16 cursor-pointer overflow-hidden bg-gray-900"
          onClick={() => setShowModal(true)}>
          <video
            src={streamUrl}
            className="h-full w-full object-cover"
            preload="metadata"
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
            <Play className="h-12 w-12 fill-white text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="p-3">
          <p className="mb-2 text-sm font-semibold text-gray-900">Short #{index + 1}</p>
          {confirmDelete ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1">
                No
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1">
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 gap-1.5">
                <Download className="h-4 w-4" />
                {isDownloading ? 'Descargando...' : 'Descargar'}
              </Button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Eliminar short">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} header={modalHeader}>
        <video
          src={streamUrl}
          className="w-full rounded-xl object-contain"
          style={{ maxHeight: '70dvh' }}
          controls
          autoPlay
          playsInline
        />
      </Modal>
    </>
  );
}
