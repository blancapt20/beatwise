"use client";

import { useState, useMemo } from "react";
import { QualityReport, ValidationResult } from "../types";

interface ValidationResultsTableProps {
  results: ValidationResult[];
  qualityReport?: QualityReport | null;
  onRowClick: (result: ValidationResult) => void;
}

type SortKey =
  | "file_name"
  | "format"
  | "duration"
  | "bitrate_declared"
  | "bitrate_real"
  | "lufs"
  | "true_peak_db"
  | "clipping_percentage";
type SortDir = "asc" | "desc";
type RenderIssue = { tag: string; label: string; severity: "error" | "warning" };

const FORMAT_COLORS: Record<string, string> = {
  mp3: "bg-[#FF6F00]",
  wav: "bg-[#00BCD4]",
  flac: "bg-[#E5E7EB] text-[#1F2937]",
};
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSampleRate(hz: number): string {
  return `${(hz / 1000).toFixed(1)} kHz`;
}

export function ValidationResultsTable({
  results,
  qualityReport,
  onRowClick,
}: ValidationResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("file_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const qualityByFile = useMemo(
    () =>
      new Map(
        (qualityReport?.files ?? []).map((item) => [item.file_name, item.quality] as const),
      ),
    [qualityReport],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const copy = [...results];
    copy.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortKey) {
        case "file_name":
          av = a.file_name.toLowerCase();
          bv = b.file_name.toLowerCase();
          break;
        case "format":
          av = a.properties?.format ?? "";
          bv = b.properties?.format ?? "";
          break;
        case "duration":
          av = a.properties?.duration ?? 0;
          bv = b.properties?.duration ?? 0;
          break;
        case "bitrate_declared":
          av = a.properties?.bitrate_declared ?? 0;
          bv = b.properties?.bitrate_declared ?? 0;
          break;
        case "bitrate_real":
          av = a.properties?.bitrate_real ?? 0;
          bv = b.properties?.bitrate_real ?? 0;
          break;
        case "lufs":
          av = qualityByFile.get(a.file_name)?.lufs ?? Number.NEGATIVE_INFINITY;
          bv = qualityByFile.get(b.file_name)?.lufs ?? Number.NEGATIVE_INFINITY;
          break;
        case "true_peak_db":
          av = qualityByFile.get(a.file_name)?.true_peak_db ?? Number.NEGATIVE_INFINITY;
          bv = qualityByFile.get(b.file_name)?.true_peak_db ?? Number.NEGATIVE_INFINITY;
          break;
        case "clipping_percentage":
          av = qualityByFile.get(a.file_name)?.clipping_percentage ?? 0;
          bv = qualityByFile.get(b.file_name)?.clipping_percentage ?? 0;
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [results, sortKey, sortDir, qualityByFile]);

  const getResultSeverity = (result: ValidationResult): "error" | "warning" | "none" => {
    return result.issue_overall_severity ?? (result.issues.length > 0 ? "warning" : "none");
  };

  const warnings = results.filter((r) => r.is_valid && getResultSeverity(r) === "warning").length;
  const errors = results.filter((r) => !r.is_valid || getResultSeverity(r) === "error").length;

  const SortArrow = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return <span className="ml-1 text-[#FF6F00]">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  const HeaderCell = ({
    label,
    column,
    className = "",
  }: {
    label: string;
    column?: SortKey;
    className?: string;
  }) => (
    <th
      className={`sticky top-0 z-10 bg-[var(--color-bg-elevated)] px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-table-header-text)] font-[family-name:var(--font-display)] ${column ? "cursor-pointer select-none hover:text-[var(--color-text-primary)]" : ""} ${className}`}
      onClick={column ? () => handleSort(column) : undefined}
    >
      {label}
      {column && <SortArrow column={column} />}
    </th>
  );

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-[var(--color-bg-elevated)] p-12">
        <p className="font-mono text-sm text-[var(--color-text-secondary)]">No files processed yet.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="max-h-[720px] overflow-x-auto overflow-y-auto rounded-xl bg-[var(--color-bg-elevated)] shadow-[0_4px_12px_var(--color-shadow-soft)]">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-[var(--color-border-strong)]">
              <HeaderCell label="Status" className="w-12" />
              <HeaderCell label="File Name" column="file_name" className="w-[220px] max-w-[220px]" />
              <HeaderCell label="Format" column="format" className="w-20" />
              <HeaderCell label="Duration" column="duration" className="w-24 text-right" />
              <HeaderCell label="Sample Rate" className="w-28 text-right" />
              <HeaderCell label="Bitrate (Declared)" column="bitrate_declared" className="w-36 text-right" />
              <HeaderCell label="Bitrate (Real)" column="bitrate_real" className="w-32 text-right" />
              <HeaderCell label="LUFS" column="lufs" className="w-24 text-right" />
              <HeaderCell label="True Peak" column="true_peak_db" className="w-28 text-right" />
              <HeaderCell label="Clipping %" column="clipping_percentage" className="w-24 text-right" />
              <HeaderCell label="Issues" className="min-w-[120px]" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((result) => {
              const issueSeverity = getResultSeverity(result);
              const displayIssues: RenderIssue[] =
                result.display_issues && result.display_issues.length > 0
                  ? result.display_issues.slice(0, 2).map((item) => ({
                      tag: item.tag,
                      label: item.label,
                      severity: item.severity,
                    }))
                  : result.issues.slice(0, 2).map((tag) => ({
                      tag,
                      label: tag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                      severity: "warning" as const,
                    }));
              const hiddenCount =
                result.hidden_issues_count ?? Math.max(0, result.issues.length - displayIssues.length);
              const hasWarning = result.is_valid && issueSeverity === "warning";
              const hasError = !result.is_valid || issueSeverity === "error";
              const fake = result.issues.includes("fake_bitrate") || result.issues.includes("fake_bitrate_severe");
              const quality = qualityByFile.get(result.file_name);

              let borderClass = "border-l-3 border-l-transparent";
              if (hasError) borderClass = "border-l-3 border-l-[#E53935]";
              else if (hasWarning) borderClass = "border-l-3 border-l-[#FFB300]";

              return (
                <tr
                  key={result.file_name}
                  onClick={() => onRowClick(result)}
                  className={`cursor-pointer border-b border-[var(--color-border-default)] transition-colors hover:bg-[var(--color-surface-hover)] ${borderClass}`}
                >
                  {/* Status icon */}
                  <td className="px-3 py-3 text-center">
                    {hasError ? (
                      <svg className="mx-auto h-5 w-5 text-[#E53935]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : hasWarning ? (
                      <svg className="mx-auto h-5 w-5 text-[#FFB300]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    ) : (
                      <svg className="mx-auto h-5 w-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </td>

                  {/* File name */}
                  <td className="px-3 py-3 w-[220px] max-w-[220px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="h-4 w-4 flex-shrink-0 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      <span className="block truncate font-mono text-sm font-medium text-[var(--color-text-primary)]" title={result.file_name}>
                        {result.file_name}
                      </span>
                    </div>
                  </td>

                  {/* Format badge */}
                  <td className="px-3 py-3">
                    {result.properties ? (
                      <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white ${FORMAT_COLORS[result.properties.format] ?? "bg-[#6B6B6B]"}`}>
                        {result.properties.format}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">—</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[var(--color-text-secondary)]">
                    {result.properties ? formatDuration(result.properties.duration) : "—"}
                  </td>

                  {/* Sample rate */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[var(--color-text-secondary)]">
                    {result.properties ? formatSampleRate(result.properties.sample_rate) : "—"}
                  </td>

                  {/* Bitrate declared */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[var(--color-text-secondary)]">
                    {result.properties
                      ? result.properties.format === "wav" && result.properties.bitrate_declared <= 0
                        ? "—"
                        : `${result.properties.bitrate_declared} kbps`
                      : "—"}
                  </td>

                  {/* Bitrate real */}
                  <td className={`px-3 py-3 text-right font-mono text-sm font-semibold ${fake ? "text-[#E53935]" : "text-[#4CAF50]"}`}>
                    {result.properties ? `${result.properties.bitrate_real} kbps` : "—"}
                  </td>

                  {/* LUFS */}
                  <td
                    className={`px-3 py-3 text-right font-mono text-sm ${
                      quality && quality.lufs < -16
                        ? "font-semibold text-[#FF6F00]"
                        : quality && quality.lufs < -12
                          ? "text-[#FFB300]"
                          : quality && quality.lufs > -5
                            ? "text-[#FF6F00]"
                            : quality && quality.lufs >= -9
                              ? "text-[#4CAF50]"
                              : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {quality ? `${quality.lufs.toFixed(1)} LUFS` : "—"}
                  </td>

                  {/* True Peak */}
                  <td
                    className={`px-3 py-3 text-right font-mono text-sm ${
                      quality && quality.true_peak_db > 2.5
                        ? "font-semibold text-[#E53935]"
                        : quality && quality.true_peak_db > 0.0
                          ? "font-semibold text-[#FF6F00]"
                          : quality && quality.true_peak_db > -0.3
                          ? "text-[#FF6F00]"
                          : quality && quality.true_peak_db > -0.5
                            ? "text-[#FFB300]"
                            : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {quality ? `${quality.true_peak_db.toFixed(1)} dBFS` : "—"}
                  </td>

                  {/* Clipping percentage */}
                  <td
                    className={`px-3 py-3 text-right font-mono text-sm ${
                      quality && quality.clipping_percentage > 1.5
                        ? "font-semibold text-[#E53935]"
                        : quality && quality.clipping_percentage > 0.6
                          ? "text-[#FF6F00]"
                          : quality && quality.clipping_percentage > 0.2
                            ? "text-[#FFB300]"
                          : "text-[#4CAF50]"
                    }`}
                  >
                    {quality ? `${quality.clipping_percentage.toFixed(4)}%` : "—"}
                  </td>

                  {/* Issues */}
                  <td className="px-3 py-3">
                    {result.issues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {displayIssues.map((issue) => {
                          const isError = issue.severity === "error";
                          return (
                            <span
                              key={issue.tag}
                              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                                isError
                                  ? "border-[#E53935] bg-[#E5393520] text-[#E53935]"
                                  : "border-[#FFB300] bg-[#FFB30020] text-[#FFB300]"
                              }`}
                            >
                              {issue.label}
                            </span>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <span className="rounded border border-[var(--color-border-strong)] bg-[var(--color-surface-hover)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
                            +{hiddenCount} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--color-text-secondary)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-center gap-6 rounded-lg bg-[var(--color-bg-elevated)] px-6 py-3 border border-[var(--color-border-strong)]">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{results.length} files validated</span>
        </div>
        <div className="h-4 w-px bg-[var(--color-border-strong)]" />
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#FFB300]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <span className="font-mono text-sm font-medium text-[#FFB300]">{warnings} warning{warnings !== 1 ? "s" : ""}</span>
        </div>
        <div className="h-4 w-px bg-[var(--color-border-strong)]" />
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#E53935]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="font-mono text-sm font-medium text-[#E53935]">{errors} error{errors !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <p className="text-center font-mono text-xs italic text-[var(--color-text-secondary)]">
        Click on a row to view file details
      </p>
    </div>
  );
}
