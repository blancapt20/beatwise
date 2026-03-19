"use client";

import { useState } from 'react';
import { Header } from '@/components/layout';
import {
  UploadZone,
  FileList,
  ProcessingStatus,
  DownloadButton,
  useUpload,
  usePolling,
} from '@/features/upload';

export default function UploadPage() {
  const {
    files,
    sessionId,
    isUploading,
    uploadError,
    addFiles,
    removeFile,
    uploadFiles,
    reset,
  } = useUpload();

  const [isProcessing, setIsProcessing] = useState(false);
  const { status } = usePolling(sessionId, isProcessing);

  const handleStartProcessing = async () => {
    try {
      await uploadFiles();
      setIsProcessing(true);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleReset = () => {
    reset();
    setIsProcessing(false);
  };

  const canStartProcessing = files.length > 0 && !isUploading && !sessionId;
  const isReady = status?.status === 'ready';

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--color-bg-primary)]">
      <Header />

      <main className="flex w-full flex-col items-center px-12 py-20">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-16 max-w-3xl text-center">
          <h1 className="font-display text-5xl font-bold text-[var(--color-text-primary)]">
            UPLOAD YOUR TRACKS
          </h1>
          <p className="font-mono text-base text-[var(--color-text-secondary)] max-w-2xl">
            Drop your audio files and we'll validate, normalize, and prepare them for your DJ set
          </p>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col gap-6 w-full max-w-3xl">
          {/* Upload Zone */}
          <UploadZone
            onFilesSelected={addFiles}
            disabled={isUploading || !!sessionId}
          />

          {/* File List */}
          {files.length > 0 && (
            <FileList files={files} onRemove={removeFile} />
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="p-4 rounded-lg bg-[#E53935]/10 border border-[#E53935]">
              <p className="font-mono text-sm text-[#E53935]">
                {uploadError}
              </p>
            </div>
          )}

          {/* Processing Status */}
          {sessionId && (
            <div className="flex flex-col gap-8 mt-8">
              <ProcessingStatus status={status} isPolling={isProcessing} />

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {isReady ? (
                  <>
                    <DownloadButton sessionId={sessionId} />
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-lg border-2 border-[var(--color-text-secondary)] font-mono text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors"
                    >
                      Upload More Files
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-mono text-sm">
                    <div className="animate-spin h-4 w-4 border-2 border-[var(--color-accent-orange)] border-t-transparent rounded-full" />
                    Processing your files...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Start Processing Button */}
          {!sessionId && files.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handleStartProcessing}
                disabled={!canStartProcessing}
                className={`
                  px-8 py-4 rounded-lg
                  font-mono text-sm font-semibold
                  transition-all
                  ${
                    canStartProcessing
                      ? 'bg-[var(--color-accent-orange)] text-[var(--color-text-on-accent)] hover:opacity-90'
                      : 'bg-[#6B6B6B] text-[var(--color-text-secondary)] cursor-not-allowed'
                  }
                `}
              >
                {isUploading ? 'Uploading...' : 'Start Processing'}
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-lg border-2 border-[var(--color-text-secondary)] font-mono text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors"
              >
                Cancel Upload
              </button>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4 w-full max-w-3xl mt-16 p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-accent-teal)]">
          <h3 className="font-display text-base font-bold text-[var(--color-accent-teal)]">
            WHAT HAPPENS NEXT?
          </h3>

          <div className="flex flex-col gap-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">
                ✓
              </span>
              <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-primary)] font-semibold">Quality Validation</span> - Check bitrate, clipping, and audio artifacts
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">
                ✓
              </span>
              <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-primary)] font-semibold">Volume Normalization</span> - Consistent loudness across all tracks
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">
                ✓
              </span>
              <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-primary)] font-semibold">Metadata Extraction</span> - Pull artist, title, BPM, and key information
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 font-mono text-sm text-[#777777] text-center max-w-2xl">
          Your processed files will be ready for download in a few minutes
        </p>
      </main>
    </div>
  );
}
