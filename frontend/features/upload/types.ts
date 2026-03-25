export interface AudioProperties {
  duration: number;
  sample_rate: number;
  channels: number;
  bitrate_declared: number;
  bitrate_real: number;
  format: string;
}

export interface QualityAnalysis {
  rms_db: number;
  lufs: number;
  true_peak_db: number;
  clipped_samples: number;
  clipping_percentage: number;
  has_clipping: boolean;
}

export interface FileQualityReport {
  file_name: string;
  quality: QualityAnalysis;
  warnings: string[];
  recommendations: string[];
}

export interface QualitySummary {
  avg_rms: number;
  avg_lufs: number;
  files_with_clipping: number;
  files_too_quiet: number;
  files_too_loud: number;
}

export interface QualityReport {
  session_id: string;
  total_files: number;
  files_analyzed: number;
  summary: QualitySummary;
  files: FileQualityReport[];
}

export interface SpectrumData {
  file_name: string;
  frequencies_hz: number[];
  magnitudes_db: number[];
}

export interface IssueDisplayItem {
  tag: string;
  label: string;
  category: string;
  severity: "error" | "warning";
  priority: number;
  worry: "critical" | "high" | "medium" | "low";
  explanation: string;
}

export interface ValidationResult {
  file_name: string;
  is_valid: boolean;
  properties: AudioProperties | null;
  issues: string[];
  display_issues?: IssueDisplayItem[];
  hidden_issues_count?: number;
  issue_overall_severity?: "error" | "warning" | "none";
  issue_primary_tag?: string | null;
  issue_primary_label?: string | null;
}
