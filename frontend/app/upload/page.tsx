"use client";

import { useState } from 'react';
import { Header } from '@/components/layout';
import { apiClient } from '@/lib/api/client';
import {
  UploadZone,
  FileList,
  ProcessingStatus,
  DownloadButton,
  ValidationResultsTable,
  ValidationDetailDialog,
  useUpload,
  usePolling,
} from '@/features/upload';
import type { FileQualityReport, ValidationResult } from '@/features/upload';

export default function UploadPage() {
  const {
    files,
    sessionId,
    isUploading,
    uploadError,
    addFilesAndUpload,
    removeFile,
    reset,
  } = useUpload();

  const [isProcessing, setIsProcessing] = useState(false);
  const { status } = usePolling(sessionId, isProcessing);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    try {
      setProcessError(null);
      await addFilesAndUpload(selectedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleStartProcessing = async () => {
    if (!sessionId || isUploading) return;
    setProcessError(null);
    try {
      await apiClient.processSession(sessionId);
      setIsProcessing(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start processing';
      setProcessError(message);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsProcessing(false);
    setSelectedResult(null);
    setProcessError(null);
  };

  const canStartProcessing = !!sessionId && !isUploading && !isProcessing;
  const isValidated = status?.status === 'validated';
  const isAnalyzed = status?.status === 'analyzed';
  const isReady = status?.status === 'ready';
  const showResults = sessionId && (isValidated || isAnalyzed || isReady) && status?.validation_results;
  const hasQualityData = (status?.quality_report?.files?.length ?? 0) > 0;

  const validationResults: ValidationResult[] = (status?.validation_results ?? []).map((r) => ({
    file_name: r.file_name,
    is_valid: r.is_valid,
    properties: r.properties,
    issues: r.issues,
    display_issues: r.display_issues,
    hidden_issues_count: r.hidden_issues_count,
    issue_overall_severity: r.issue_overall_severity,
    issue_primary_tag: r.issue_primary_tag,
    issue_primary_label: r.issue_primary_label,
  }));
  const qualityByFile = new Map<string, FileQualityReport>(
    (status?.quality_report?.files ?? []).map((item) => [item.file_name, item] as const),
  );
  const selectedQuality = selectedResult ? qualityByFile.get(selectedResult.file_name) ?? null : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--color-bg-primary)]">
      <Header />

      <main className="flex w-full flex-col items-center px-6 py-20 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-16 max-w-3xl text-center">
          <h1 className="font-display text-5xl font-bold text-[var(--color-text-primary)]">
            {showResults ? 'VALIDATION RESULTS' : 'UPLOAD YOUR TRACKS'}
          </h1>
          <p className="font-mono text-base text-[var(--color-text-secondary)] max-w-2xl">
            {showResults
              ? 'Your files have been validated. Review the results below before downloading.'
              : 'Drop or select your audio files to auto-upload instantly, then start processing when all tracks are ready.'}
          </p>
        </div>

        {/* === VALIDATION RESULTS VIEW === */}
        {showResults ? (
          <div className="flex flex-col gap-8 w-full max-w-[1200px]">
            {!hasQualityData && (
              <div className="rounded-lg border border-[#FFB300] bg-[#FFB3001A] px-4 py-3">
                <p className="font-mono text-sm text-[#E0E0E0]">
                  Quality analysis data is not available for this session yet. Restart the backend
                  with Sprint 3 code and upload again to see LUFS, true peak, clipping, and spectrum.
                </p>
              </div>
            )}
            <ValidationResultsTable
              results={validationResults}
              qualityReport={status?.quality_report}
              onRowClick={setSelectedResult}
            />

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <DownloadButton sessionId={sessionId!} />
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-lg border-2 border-[var(--color-text-secondary)] font-mono text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors"
              >
                Upload More Files
              </button>
            </div>

            <ValidationDetailDialog
              sessionId={sessionId!}
              result={selectedResult}
              qualityReport={selectedQuality}
              onClose={() => setSelectedResult(null)}
            />
          </div>
        ) : (
          /* === UPLOAD VIEW === */
          <div className="flex flex-col gap-6 w-full max-w-3xl">
            {files.length === 0 && (
              <UploadZone
                onFilesSelected={handleFilesSelected}
                disabled={isUploading || !!sessionId}
              />
            )}

            {files.length > 0 && (
              <FileList
                files={files}
                onRemove={removeFile}
                canRemove={!isUploading && !isProcessing && !showResults}
              />
            )}

            {(uploadError || processError) && (
              <div className="p-4 rounded-lg bg-[#E53935]/10 border border-[#E53935]">
                <p className="font-mono text-sm text-[#E53935]">{uploadError ?? processError}</p>
              </div>
            )}

            {sessionId && !isUploading && !isProcessing && !showResults && (
              <p className="text-center font-mono text-sm text-[var(--color-text-secondary)]">
                Upload complete. Click <span className="text-[var(--color-text-primary)] font-semibold">Start Processing</span> to run validation and then view the Validation Results table.
              </p>
            )}

            {/* Analysis status (shown only after user starts processing) */}
            {isProcessing && !showResults && (
              <div className="flex flex-col gap-8 mt-8">
                <ProcessingStatus
                  status={status}
                  isPolling={isProcessing}
                />
                <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)] font-mono text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-[var(--color-accent-orange)] border-t-transparent rounded-full" />
                  {status?.status === 'analyzing'
                    ? 'Analyzing your audio quality...'
                    : 'Validating and processing your files...'}
                </div>
              </div>
            )}

            {/* Start Processing Button */}
            {files.length > 0 && (
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
                  {isUploading
                    ? 'Uploading...'
                    : sessionId
                      ? `Start Processing (${files.length} Track${files.length > 1 ? 's' : ''})`
                      : 'Waiting for Upload'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-4 rounded-lg border-2 border-[var(--color-text-secondary)] font-mono text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors"
                >
                  {sessionId ? 'Upload More Files' : 'Cancel Upload'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Panel - only show before processing */}
        {!showResults && (
          <div className="flex flex-col gap-4 w-full max-w-3xl mt-16 p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-accent-teal)]">
            <h3 className="font-display text-base font-bold text-[var(--color-accent-teal)]">
              WHAT HAPPENS NEXT?
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">✓</span>
                <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-text-primary)] font-semibold">Quality Validation</span> - Check bitrate, clipping, and audio artifacts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">✓</span>
                <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-text-primary)] font-semibold">Volume Normalization</span> - Consistent loudness across all tracks
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-accent-teal)] font-display text-lg flex-shrink-0">✓</span>
                <p className="font-mono text-sm text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-text-primary)] font-semibold">Metadata Extraction</span> - Pull artist, title, BPM, and key information
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
