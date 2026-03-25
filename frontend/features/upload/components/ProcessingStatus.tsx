"use client";

import { StatusResponse } from '@/lib/api/client';

interface ProcessingStatusProps {
  status: StatusResponse | null;
  isPolling: boolean;
}

export function ProcessingStatus({
  status,
  isPolling,
}: ProcessingStatusProps) {
  if (!isPolling) return null;

  const getProgress = () => {
    if (!status) return 20;
    if (status.status === 'uploaded') return 25;
    if (status.status === 'validating') return 30;
    if (status.status === 'analyzing') return 75;
    if (status.status === 'processing') return 90;
    if (status.status === 'analyzed') return 100;
    if (status.status === 'validated') return 100;
    if (status.status === 'ready') return 100;
    return 0;
  };

  const getLabel = () => {
    if (!status) {
      return 'Starting processing...';
    }
    if (status.status === 'uploaded') return 'Preparing analysis...';
    if (status.status === 'validating') return `Validating ${status.files_count} file(s)...`;
    if (status.status === 'analyzing') return `Analyzing quality for ${status.files_count} file(s)...`;
    if (status.status === 'processing') return `Finalizing ${status.files_count} file(s)...`;
    if (status.status === 'analyzed') return 'Quality analysis complete!';
    if (status.status === 'validated') return 'Validation complete!';
    if (status.status === 'ready') return 'Processing complete!';
    if (status.status === 'error') return 'Processing failed';
    return 'Analyzing your files...';
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
