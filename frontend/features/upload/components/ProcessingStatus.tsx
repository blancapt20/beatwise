"use client";

import { StatusResponse } from '@/lib/api/client';

interface ProcessingStatusProps {
  status: StatusResponse | null;
  isPolling: boolean;
}

export function ProcessingStatus({ status, isPolling }: ProcessingStatusProps) {
  if (!status) return null;

  const getProgress = () => {
    if (status.status === 'uploaded') return 0;
    if (status.status === 'validating') return 40;
    if (status.status === 'analyzing') return 75;
    if (status.status === 'analyzed') return 100;
    if (status.status === 'validated') return 100;
    if (status.status === 'processing') return 65;
    if (status.status === 'ready') return 100;
    return 0;
  };

  const progress = getProgress();

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Progress Label */}
      <div className="flex justify-between items-center">
        <p className="font-mono text-sm font-medium text-[var(--color-text-primary)]">
          {status.status === 'uploaded' && 'Ready to process...'}
          {status.status === 'validating' && `Validating ${status.files_count} file(s)...`}
          {status.status === 'analyzing' && `Analyzing quality for ${status.files_count} file(s)...`}
          {status.status === 'analyzed' && 'Quality analysis complete!'}
          {status.status === 'validated' && 'Validation complete!'}
          {status.status === 'processing' && `Processing ${status.files_count} file(s)...`}
          {status.status === 'ready' && 'Processing complete!'}
          {status.status === 'error' && 'Processing failed'}
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
