"use client";

import { apiClient } from '@/lib/api/client';

interface DownloadButtonProps {
  sessionId: string;
  disabled?: boolean;
}

export function DownloadButton({ sessionId, disabled }: DownloadButtonProps) {
  const handleDownload = () => {
    const url = apiClient.getDownloadUrl(sessionId);
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        px-6 py-3 rounded-lg
        font-mono text-sm font-semibold
        transition-all
        ${
          disabled
            ? 'bg-[#6B6B6B] text-[var(--color-text-secondary)] cursor-not-allowed'
            : 'bg-[var(--color-accent-orange)] text-[var(--color-text-on-accent)] hover:opacity-90'
        }
      `}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download Processed Files
    </button>
  );
}
