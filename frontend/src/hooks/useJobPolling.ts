import { videoService } from '@/api/services/video.service';
import type { JobState } from '@/types/video.types';
import { useEffect, useRef, useCallback } from 'react';

interface UseJobPollingOptions {
  idJob: number | null;
  enabled: boolean;
  intervalMs?: number;
  onFinished: (state: JobState) => void;
  onFailed: (state: JobState) => void;
}

export function useJobPolling({
  idJob,
  enabled,
  intervalMs = 3000,
  onFinished,
  onFailed,
}: UseJobPollingOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishedRef = useRef(onFinished);
  const onFailedRef = useRef(onFailed);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    onFailedRef.current = onFailed;
  }, [onFailed]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || idJob === null) return;

    const poll = async () => {
      try {
        const state = await videoService.getJobStatus(idJob);

        if (state.state === 'COMPLETED') {
          stopPolling();
          onFinishedRef.current(state);
        } else if (state.state === 'FAILED') {
          stopPolling();
          onFailedRef.current(state);
        }
        // START / PROCESSING → seguir poliando
      } catch (error) {
        console.error('Error polling job status:', error);
        // No detener el polling por un error de red puntual
      }
    };

    // Primer poll inmediato
    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    return () => stopPolling();
  }, [enabled, idJob, intervalMs, stopPolling]);
}
