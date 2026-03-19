"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, StatusResponse } from '@/lib/api/client';

export function usePolling(sessionId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await apiClient.getStatus(sessionId);
      setStatus(response);
      setError(null);

      if (response.status === 'ready' || response.status === 'validated' || response.status === 'error') {
        setIsPolling(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(message);
      setIsPolling(false);
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

    fetchStatus();

    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [enabled, sessionId, fetchStatus]);

  return {
    status,
    isPolling,
    error,
    refetch: fetchStatus,
  };
}
