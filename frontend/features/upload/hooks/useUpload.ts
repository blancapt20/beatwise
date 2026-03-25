"use client";

import { useState, useCallback } from 'react';
import { apiClient, UploadResponse } from '@/lib/api/client';

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

export function useUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Mark all as uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      // Upload to backend
      const response: UploadResponse = await apiClient.uploadFiles(
        files.map(f => f.file),
        { onUploadProgress: setUploadProgress }
      );

      // Mark all as uploaded
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploaded' as const })));
      setSessionId(response.session_id);

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(message);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: message })));
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  const reset = useCallback(() => {
    setFiles([]);
    setSessionId(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  return {
    files,
    sessionId,
    isUploading,
    uploadProgress,
    uploadError,
    addFiles,
    removeFile,
    uploadFiles,
    reset,
  };
}
