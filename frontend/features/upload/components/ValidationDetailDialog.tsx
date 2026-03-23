"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileQualityReport, SpectrumData, ValidationResult } from "../types";
import { SpectrumChart } from "./SpectrumChart";

interface ValidationDetailDialogProps {
  sessionId: string;
  result: ValidationResult | null;
  qualityReport?: FileQualityReport | null;
  onClose: () => void;
}

const ISSUE_EXPLANATIONS: Record<string, string> = {
  fake_bitrate: "Declared bitrate does not match the real bitrate estimated from file size and duration. This file was likely transcoded from a lower quality source.",
  corrupted: "The audio file could not be read or decoded. It may be damaged or truncated.",
  unsupported_format: "The file format is not supported. Only MP3, WAV, and FLAC are accepted.",
  file_not_found: "The file was not found on disk.",
  too_quiet: "The file loudness is below -18 LUFS and may sound weak in a set.",
  too_loud: "The file loudness is above -8 LUFS and may distort in playback.",
  minor_clipping: "Slight clipping detected (0.01% to 0.1% clipped samples).",
  moderate_clipping: "Clipping is clearly visible (0.1% to 0.5% clipped samples).",
  major_clipping: "Heavy clipping detected (>0.5% clipped samples). Source quality may be compromised.",
  low_headroom: "Low headroom (-1.0 to -0.3 dBTP). May clip on large systems.",
  very_hot_signal: "Very hot signal (-0.3 to 0.0 dBTP). High risk of distortion.",
  tp_overs: "Clipping detected (>0.0 dBTP true peak).",
};

function formatDurationLong(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s} sec (${seconds.toFixed(1)}s)`;
}

function formatSampleRate(hz: number): string {
  return `${hz.toLocaleString()} Hz`;
}

export function ValidationDetailDialog({
  sessionId,
  result,
  qualityReport,
  onClose,
}: ValidationDetailDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [spectrum, setSpectrum] = useState<SpectrumData | null>(null);
  const [isLoadingSpectrum, setIsLoadingSpectrum] = useState(false);
  const [spectrumError, setSpectrumError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (result) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [result, onClose]);

  useEffect(() => {
    if (!result) {
      setSpectrum(null);
      setSpectrumError(null);
      setIsLoadingSpectrum(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingSpectrum(true);
    setSpectrumError(null);
    setSpectrum(null);

    apiClient
      .getSpectrum(sessionId, result.file_name)
      .then((response) => {
        if (!isCancelled) {
          setSpectrum(response);
          setIsLoadingSpectrum(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Failed to load spectrum.";
          setSpectrumError(message);
          setIsLoadingSpectrum(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [sessionId, result]);

  if (!result) return null;

  const props = result.properties;
  const isFake =
    props && props.bitrate_declared > 0 && props.bitrate_real > 0 &&
    Math.abs(props.bitrate_declared - props.bitrate_real) / props.bitrate_declared > 0.2;

  const propertyRows = props
    ? [
        { label: "Format", value: props.format.toUpperCase() },
        { label: "Duration", value: formatDurationLong(props.duration) },
        { label: "Sample Rate", value: formatSampleRate(props.sample_rate) },
        { label: "Channels", value: `${props.channels} (${props.channels === 1 ? "Mono" : "Stereo"})` },
        { label: "Bitrate (Declared)", value: `${props.bitrate_declared} kbps` },
        { label: "Bitrate (Real)", value: `${props.bitrate_real} kbps`, highlight: isFake },
      ]
    : [];
  const qualityRows = qualityReport
    ? [
        { label: "RMS", value: `${qualityReport.quality.rms_db.toFixed(2)} dBFS` },
        { label: "LUFS", value: `${qualityReport.quality.lufs.toFixed(2)} LUFS` },
        { label: "True Peak", value: `${qualityReport.quality.true_peak_db.toFixed(2)} dBFS` },
        { label: "Clipped Samples", value: qualityReport.quality.clipped_samples.toLocaleString() },
        { label: "Clipping", value: `${qualityReport.quality.clipping_percentage.toFixed(4)}%` },
      ]
    : [];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="flex w-full max-w-[560px] max-h-[90vh] flex-col overflow-y-auto rounded-xl bg-[var(--color-bg-elevated)] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#6B6B6B] px-6 py-5">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {result.file_name}
              </h2>
              {props && (
                <p className="font-mono text-xs text-[#E0E0E0]">
                  {Math.floor(props.duration / 60)}:{Math.floor(props.duration % 60).toString().padStart(2, "0")} · {props.format.toUpperCase()} · {(props.sample_rate / 1000).toFixed(1)} kHz
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-[#3A3A3A]">
            <svg className="h-5 w-5 text-[#E0E0E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Properties */}
        {props && (
          <div className="flex flex-col gap-4 px-6 py-5">
            <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-[#FFD600]">
              AUDIO PROPERTIES
            </h3>
            <div className="flex flex-col">
              {propertyRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center py-2.5 ${i < propertyRows.length - 1 ? "border-b border-[#3A3A3A]" : ""}`}
                >
                  <span className="w-40 font-mono text-sm text-[#6B6B6B]">{row.label}</span>
                  <span className={`font-mono text-sm ${row.highlight ? "font-bold text-[#E53935]" : "text-white"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {result.issues.length > 0 && (
          <div className="flex flex-col gap-3 px-6 pb-5">
            <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-[#E53935]">
              ISSUES DETECTED
            </h3>
            {result.issues.map((issue) => (
              <div
                key={issue}
                className="flex items-start gap-3 rounded-lg border border-[#E53935] bg-[#E5393510] p-4"
              >
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FFB300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-sm font-bold text-[#FFB300]">
                    {issue.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <p className="font-mono text-xs leading-relaxed text-[#E0E0E0]">
                    {ISSUE_EXPLANATIONS[issue] ?? "An unknown issue was detected."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quality */}
        {qualityRows.length > 0 && (
          <div className="flex flex-col gap-4 px-6 pb-5">
            <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-[#FFD600]">
              QUALITY ANALYSIS
            </h3>
            <div className="flex flex-col">
              {qualityRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center py-2.5 ${i < qualityRows.length - 1 ? "border-b border-[#3A3A3A]" : ""}`}
                >
                  <span className="w-40 font-mono text-sm text-[#6B6B6B]">{row.label}</span>
                  <span className="font-mono text-sm text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spectrum */}
        <div className="flex flex-col gap-3 px-6 pb-5">
          <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-[#FFD600]">
            FREQUENCY SPECTRUM
          </h3>
          {isLoadingSpectrum && (
            <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-[#3A3A3A] bg-[#1C1C1C]">
              <p className="font-mono text-xs italic text-[#6B6B6B]">Loading spectrum...</p>
            </div>
          )}
          {!isLoadingSpectrum && spectrumError && (
            <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-[#E53935] bg-[#E5393510] px-4">
              <p className="text-center font-mono text-xs text-[#E0E0E0]">{spectrumError}</p>
            </div>
          )}
          {!isLoadingSpectrum && !spectrumError && spectrum && <SpectrumChart data={spectrum} />}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#6B6B6B] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-[#E0E0E0] px-6 py-2.5 font-mono text-sm font-medium text-[#E0E0E0] transition-colors hover:border-white hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
