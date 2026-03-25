"use client";

import { useCallback } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    },
    [onFilesSelected, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.mp3,.wav,.flac';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      onFilesSelected(files);
    };
    input.click();
  }, [onFilesSelected, disabled]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center
        w-full h-60
        border-2 border-dashed rounded-xl
        transition-all cursor-pointer
        ${
          disabled
            ? 'border-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] opacity-50 cursor-not-allowed'
            : 'border-[var(--color-accent-orange)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-secondary)]'
        }
      `}
    >
      {/* Upload Icon */}
      <svg
        className="w-16 h-16 mb-4 text-[var(--color-accent-orange)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      {/* Title */}
      <p className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
        CLICK TO UPLOAD OR DRAG AND DROP
      </p>

      {/* Subtitle */}
      <p className="font-mono text-sm text-[var(--color-text-secondary)]">
        Auto-upload starts instantly • MP3, WAV, FLAC • Max 50MB per file • Up to 200 files
      </p>
    </div>
  );
}
