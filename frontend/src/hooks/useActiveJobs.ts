import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { videoService } from '@/api/services/video.service';

export function useActiveJobs() {
  const [activeJobIds, setActiveJobIds] = useState<number[]>(() => storage.getActiveJobs());

  // Sincronizar con el backend al montar: recupera jobs realmente en PROCESSING
  // por si el usuario recargó, cambió de dispositivo, o localStorage fue limpiado
  useEffect(() => {
    videoService
      .getProcessingJobs()
      .then((jobs) => {
        const backendIds = jobs.map((j) => j.idJob);
        if (backendIds.length === 0) return;
        setActiveJobIds((prev) => {
          const merged = [...new Set([...prev, ...backendIds])];
          storage.setActiveJobs(merged);
          return merged;
        });
      })
      .catch(() => {
        // Si falla la sincronización, el localStorage sigue siendo la fuente de verdad
      });
  }, []);

  const addJob = (id: number) => {
    setActiveJobIds((prev) => {
      const next = [...prev, id];
      storage.setActiveJobs(next);
      return next;
    });
  };

  const removeJob = (id: number) => {
    setActiveJobIds((prev) => {
      const next = prev.filter((j) => j !== id);
      storage.setActiveJobs(next);
      return next;
    });
  };

  const clearJobs = () => {
    setActiveJobIds([]);
    storage.clearActiveJobs();
  };

  return { activeJobIds, addJob, removeJob, clearJobs };
}
