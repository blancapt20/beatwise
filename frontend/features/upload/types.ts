export interface AudioProperties {
  duration: number;
  sample_rate: number;
  channels: number;
  bitrate_declared: number;
  bitrate_real: number;
  format: string;
}

export interface ValidationResult {
  file_name: string;
  is_valid: boolean;
  properties: AudioProperties | null;
  issues: string[];
}
