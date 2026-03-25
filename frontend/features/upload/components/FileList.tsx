"use client";

import { UploadedFile } from '../hooks/useUpload';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (fileId: string) => void | Promise<void>;
  canRemove?: boolean;
}

export function FileList({ files, onRemove, canRemove = true }: FileListProps) {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const badges = {
      pending: { text: 'Pending', color: 'bg-[#6B6B6B] text-[var(--color-text-secondary)]' },
      uploading: { text: 'Uploading', color: 'bg-[#FFB300] text-[#0D0D0D]' },
      uploaded: { text: 'Uploaded', color: 'bg-[#4CAF50] text-[#FFFFFF]' },
      error: { text: 'Error', color: 'bg-[#E53935] text-[#FFFFFF]' },
    };

    const badge = badges[status];

    return (
      <span className={`px-3 py-1 rounded-md font-mono text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <h3 className="font-display text-base font-bold text-[var(--color-accent-teal)]">
        UPLOADED TRACKS (READY TO PROCESS) ({files.length})
      </h3>

      {/* Files */}
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[#6B6B6B]"
        >
          {/* Music Icon */}
          <svg
            className="w-6 h-6 text-[var(--color-accent-orange)] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>

          {/* File Info */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="font-mono text-sm font-medium text-[var(--color-text-primary)] truncate" title={file.file.name}>
              {file.file.name}
            </p>
            <p className="font-mono text-xs text-[var(--color-text-secondary)]">
              {formatFileSize(file.file.size)}
            </p>
            {(file.status === 'uploading' || file.status === 'uploaded') && (
              <div className="mt-1">
                <div className="w-full h-1.5 bg-[#6B6B6B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent-orange)] transition-all duration-200"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-[10px] text-[var(--color-text-secondary)]">
                  {file.status === 'uploaded' ? 'Uploaded (100%)' : `Uploading... ${file.progress}%`}
                </p>
              </div>
            )}
            {file.status === 'error' && file.error && (
              <p className="mt-1 font-mono text-[10px] text-[#E53935]">
                {file.error}
              </p>
            )}
          </div>

          {/* Status Badge */}
          {getStatusBadge(file.status)}

          {/* Delete Button */}
          <button
            onClick={() => onRemove(file.id)}
            disabled={!canRemove}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Remove file"
          >
            <svg
              className="w-5 h-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
