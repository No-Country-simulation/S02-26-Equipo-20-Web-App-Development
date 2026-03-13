import { useJobPolling } from '@/hooks/useJobPolling';

interface JobPollerProps {
  jobId: number;
  onFinished: (id: number) => void;
  onFailed: (id: number) => void;
}

export function JobPoller({ jobId, onFinished, onFailed }: JobPollerProps) {
  useJobPolling({
    idJob: jobId,
    enabled: true,
    onFinished: () => onFinished(jobId),
    onFailed: () => onFailed(jobId),
  });
  return null;
}
