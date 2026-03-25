"use client";

import { StatusResponse } from '@/lib/api/client';

interface ProcessingStatusProps {
  status: StatusResponse | null;
  isPolling: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  filesCount?: number;
}

export function ProcessingStatus({
  status,
  isPolling,
  isUploading = false,
  uploadProgress = 0,
  filesCount = 0,
}: ProcessingStatusProps) {
  if (!status && !isUploading) return null;

  const getProgress = () => {
    if (isUploading) {
      // Uploading contributes the first phase of the full pipeline.
      return Math.min(30, Math.round((uploadProgress / 100) * 30));
    }
    if (!status) return 30;
    if (status.status === 'uploaded') return 30;
    if (status.status === 'validating') return 50;
    if (status.status === 'analyzing') return 80;
    if (status.status === 'analyzed') return 100;
    if (status.status === 'validated') return 100;
    if (status.status === 'processing') return 70;
    if (status.status === 'ready') return 100;
    return 0;
  };

  const getLabel = () => {
    if (isUploading) {
      return `Uploading ${filesCount} file(s)...`;
    }
    if (!status) {
      return 'Upload complete. Starting validation...';
    }
    if (status.status === 'uploaded') return 'Upload complete. Preparing validation...';
    if (status.status === 'validating') return `Validating ${status.files_count} file(s)...`;
    if (status.status === 'analyzing') return `Analyzing quality for ${status.files_count} file(s)...`;
    if (status.status === 'analyzed') return 'Quality analysis complete!';
    if (status.status === 'validated') return 'Validation complete!';
    if (status.status === 'processing') return `Processing ${status.files_count} file(s)...`;
    if (status.status === 'ready') return 'Processing complete!';
    if (status.status === 'error') return 'Processing failed';
    return 'Processing your files...';
  };

  const progress = getProgress();
  const label = getLabel();

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Progress Label */}
      <div className="flex justify-between items-center">
        <p className="font-mono text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold text-[var(--color-accent-teal)]">
          {progress}%
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#6B6B6B] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent-orange)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
