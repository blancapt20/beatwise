"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, StatusResponse } from '@/lib/api/client';

export function usePolling(sessionId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (): Promise<StatusResponse | null> => {
    if (!sessionId) return null;

    try {
      const response = await apiClient.getStatus(sessionId);
      setStatus(response);
      setError(null);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(message);
      throw new Error(message);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setStatus(null);
      setError(null);
      setIsPolling(false);
      return;
    }

    if (!enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const stopStatuses = new Set(['ready', 'validated', 'analyzed', 'error']);
    let stopped = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (stopped) return;
      try {
        const response = await fetchStatus();
        if (response && stopStatuses.has(response.status)) {
          stopped = true;
          setIsPolling(false);
          if (interval) clearInterval(interval);
        }
      } catch {
        stopped = true;
        setIsPolling(false);
        if (interval) clearInterval(interval);
      }
    };

    void tick();
    interval = setInterval(() => {
      void tick();
    }, 2000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [enabled, sessionId, fetchStatus]);

  return {
    status,
    isPolling,
    error,
    refetch: fetchStatus,
  };
}
