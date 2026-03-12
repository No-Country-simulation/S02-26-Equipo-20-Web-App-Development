const KEYS = {
  activeJobs: 'activeJobIds',
  reprocessJob: (videoId: string) => `reprocessJobId:${videoId}`,
} as const;

export const storage = {
  getActiveJobs: (): number[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.activeJobs) ?? '[]');
    } catch {
      return [];
    }
  },
  setActiveJobs: (ids: number[]) => {
    if (ids.length === 0) {
      localStorage.removeItem(KEYS.activeJobs);
    } else {
      localStorage.setItem(KEYS.activeJobs, JSON.stringify(ids));
    }
  },
  clearActiveJobs: () => localStorage.removeItem(KEYS.activeJobs),

  getReprocessJob: (videoId: string): number | null => {
    const v = localStorage.getItem(KEYS.reprocessJob(videoId));
    return v ? Number(v) : null;
  },
  setReprocessJob: (videoId: string, jobId: number) =>
    localStorage.setItem(KEYS.reprocessJob(videoId), String(jobId)),
  clearReprocessJob: (videoId: string) => localStorage.removeItem(KEYS.reprocessJob(videoId)),

  clearAll: () => {
    localStorage.removeItem(KEYS.activeJobs);
  },
} as const;
