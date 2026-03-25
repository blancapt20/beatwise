"use client";

import { useState, useCallback } from 'react';
import { apiClient, UploadResponse } from '@/lib/api/client';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  error?: string;
}

export function useUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createUploadItems = useCallback(
    (newFiles: File[]): UploadedFile[] =>
      newFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
      })),
    [],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const uploadedFiles = createUploadItems(newFiles);
      setFiles((prev) => [...prev, ...uploadedFiles]);
    },
    [createUploadItems],
  );

  const removeFile = useCallback(
    async (fileId: string) => {
      const target = files.find((f) => f.id === fileId);
      if (!target) return;
      setUploadError(null);

      // Before upload completes, this is only local removal.
      if (!sessionId) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        return;
      }

      // After upload completes, remove from backend session first.
      try {
        const response = await apiClient.removeSessionFile(sessionId, target.file.name);
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (response.session_deleted || response.files_count === 0) {
          setSessionId(null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove file from session';
        setUploadError(message);
        throw error;
      }
    },
    [files, sessionId],
  );

  const uploadFiles = useCallback(
    async (targetFiles?: UploadedFile[]) => {
      const filesToUpload = targetFiles ?? files.filter((f) => f.status === 'pending');
      if (filesToUpload.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      const uploadIdSet = new Set(filesToUpload.map((f) => f.id));
      const totalBytes = filesToUpload.reduce((sum, f) => sum + f.file.size, 0);
      let cumulativeSizes = 0;
      const byteRanges = filesToUpload.map((f) => {
        const start = cumulativeSizes;
        cumulativeSizes += f.file.size;
        return { id: f.id, start, size: Math.max(f.file.size, 1) };
      });

      try {
        // Mark selected files as uploading.
        setFiles((prev) =>
          prev.map((f) =>
            uploadIdSet.has(f.id)
              ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
              : f,
          ),
        );

        const response: UploadResponse = await apiClient.uploadFiles(
          filesToUpload.map((f) => f.file),
          {
            onUploadProgress: (progress, loadedBytes) => {
              setUploadProgress(progress);
              const estimatedLoaded = Math.round((progress / 100) * (totalBytes || loadedBytes));
              setFiles((prev) =>
                prev.map((f) => {
                  if (!uploadIdSet.has(f.id)) return f;
                  const range = byteRanges.find((r) => r.id === f.id);
                  if (!range) return f;
                  const loadedForFile = Math.max(0, Math.min(range.size, estimatedLoaded - range.start));
                  const fileProgress = Math.round((loadedForFile / range.size) * 100);
                  return { ...f, progress: fileProgress, status: 'uploading' as const };
                }),
              );
            },
          },
        );

        // Mark selected files as uploaded.
        setFiles((prev) =>
          prev.map((f) =>
            uploadIdSet.has(f.id) ? { ...f, status: 'uploaded' as const, progress: 100 } : f,
          ),
        );
        setSessionId(response.session_id);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        setUploadError(message);
        setFiles((prev) =>
          prev.map((f) =>
            uploadIdSet.has(f.id) ? { ...f, status: 'error' as const, error: message } : f,
          ),
        );
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [files],
  );

  const addFilesAndUpload = useCallback(
    async (newFiles: File[]) => {
      const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);
      const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);

      if (oversizedFiles.length > 0) {
        const names = oversizedFiles.map((file) => file.name).slice(0, 3).join(', ');
        setUploadError(
          `Some files exceed 50MB and were skipped: ${names}${oversizedFiles.length > 3 ? '...' : ''}`,
        );
      } else {
        setUploadError(null);
      }

      if (validFiles.length === 0) return;

      const uploadItems = createUploadItems(validFiles);
      setFiles((prev) => [...prev, ...uploadItems]);
      return uploadFiles(uploadItems);
    },
    [createUploadItems, uploadFiles],
  );

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
    addFilesAndUpload,
    removeFile,
    uploadFiles,
    reset,
  };
}
