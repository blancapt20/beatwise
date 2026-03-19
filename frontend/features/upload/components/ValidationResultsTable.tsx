"use client";

import { useState, useMemo } from "react";
import { ValidationResult } from "../types";

interface ValidationResultsTableProps {
  results: ValidationResult[];
  onRowClick: (result: ValidationResult) => void;
}

type SortKey = "file_name" | "format" | "duration" | "bitrate_declared" | "bitrate_real";
type SortDir = "asc" | "desc";

const FORMAT_COLORS: Record<string, string> = {
  mp3: "bg-[#FF6F00]",
  wav: "bg-[#00BCD4]",
  flac: "bg-[#E0E0E0] text-[#1C1C1C]",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSampleRate(hz: number): string {
  return `${(hz / 1000).toFixed(1)} kHz`;
}

function isFakeBitrate(declared: number, real: number): boolean {
  if (declared <= 0 || real <= 0) return false;
  return Math.abs(declared - real) / declared > 0.2;
}

export function ValidationResultsTable({ results, onRowClick }: ValidationResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("file_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [results, sortKey, sortDir]);

  const warnings = results.filter((r) => r.is_valid && r.issues.length > 0).length;
  const errors = results.filter((r) => !r.is_valid).length;

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
      className={`px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#E0E0E0] font-[family-name:var(--font-display)] ${column ? "cursor-pointer select-none hover:text-white" : ""} ${className}`}
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
      <div className="overflow-x-auto rounded-xl bg-[var(--color-bg-elevated)] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#6B6B6B]">
              <HeaderCell label="" className="w-12" />
              <HeaderCell label="File Name" column="file_name" className="min-w-[180px]" />
              <HeaderCell label="Format" column="format" className="w-20" />
              <HeaderCell label="Duration" column="duration" className="w-24 text-right" />
              <HeaderCell label="Sample Rate" className="w-28 text-right" />
              <HeaderCell label="Bitrate (Declared)" column="bitrate_declared" className="w-36 text-right" />
              <HeaderCell label="Bitrate (Real)" column="bitrate_real" className="w-32 text-right" />
              <HeaderCell label="Issues" className="min-w-[120px]" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((result) => {
              const hasWarning = result.is_valid && result.issues.length > 0;
              const hasError = !result.is_valid;
              const fake =
                result.properties &&
                isFakeBitrate(result.properties.bitrate_declared, result.properties.bitrate_real);

              let borderClass = "border-l-3 border-l-transparent";
              if (hasError) borderClass = "border-l-3 border-l-[#E53935]";
              else if (hasWarning) borderClass = "border-l-3 border-l-[#FFB300]";

              return (
                <tr
                  key={result.file_name}
                  onClick={() => onRowClick(result)}
                  className={`cursor-pointer border-b border-[#3A3A3A] transition-colors hover:bg-[#333333] ${borderClass}`}
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
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 flex-shrink-0 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      <span className="truncate font-mono text-sm font-medium text-white" title={result.file_name}>
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
                      <span className="text-[#6B6B6B]">—</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[#E0E0E0]">
                    {result.properties ? formatDuration(result.properties.duration) : "—"}
                  </td>

                  {/* Sample rate */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[#E0E0E0]">
                    {result.properties ? formatSampleRate(result.properties.sample_rate) : "—"}
                  </td>

                  {/* Bitrate declared */}
                  <td className="px-3 py-3 text-right font-mono text-sm text-[#E0E0E0]">
                    {result.properties ? `${result.properties.bitrate_declared} kbps` : "—"}
                  </td>

                  {/* Bitrate real */}
                  <td className={`px-3 py-3 text-right font-mono text-sm font-semibold ${fake ? "text-[#E53935]" : "text-[#4CAF50]"}`}>
                    {result.properties ? `${result.properties.bitrate_real} kbps` : "—"}
                  </td>

                  {/* Issues */}
                  <td className="px-3 py-3">
                    {result.issues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.issues.map((issue) => {
                          const isError = issue === "corrupted" || issue === "unsupported_format";
                          return (
                            <span
                              key={issue}
                              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                                isError
                                  ? "border-[#E53935] bg-[#E5393520] text-[#E53935]"
                                  : "border-[#FFB300] bg-[#FFB30020] text-[#FFB300]"
                              }`}
                            >
                              {issue.replace(/_/g, " ")}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-[#6B6B6B]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-center gap-6 rounded-lg bg-[var(--color-bg-elevated)] px-6 py-3 border border-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-mono text-sm font-semibold text-white">{results.length} files validated</span>
        </div>
        <div className="h-4 w-px bg-[#6B6B6B]" />
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#FFB300]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <span className="font-mono text-sm font-medium text-[#FFB300]">{warnings} warning{warnings !== 1 ? "s" : ""}</span>
        </div>
        <div className="h-4 w-px bg-[#6B6B6B]" />
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#E53935]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="font-mono text-sm font-medium text-[#4CAF50]">{errors} error{errors !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <p className="text-center font-mono text-xs italic text-[#6B6B6B]">
        Click on a row to view file details
      </p>
    </div>
  );
}
