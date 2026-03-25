const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type ProcessingStatus =
  | 'uploaded'
  | 'validating'
  | 'validated'
  | 'analyzing'
  | 'analyzed'
  | 'processing'
  | 'ready'
  | 'error'
  | string;

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
  display_issues?: IssueDisplayItem[];
  hidden_issues_count?: number;
  issue_overall_severity?: 'error' | 'warning' | 'none';
  issue_primary_tag?: string | null;
  issue_primary_label?: string | null;
}

export interface IssueDisplayItem {
  tag: string;
  label: string;
  category: string;
  severity: 'error' | 'warning';
  priority: number;
  worry: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
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

export interface UploadResponse {
  session_id: string;
  files_count: number;
  status: ProcessingStatus;
  message: string;
}

export interface UploadOptions {
  onUploadProgress?: (progress: number) => void;
}

export interface StatusResponse {
  session_id: string;
  status: ProcessingStatus;
  files_count: number;
  created_at: string;
  error?: string | null;
  validation_results?: ValidationResult[] | null;
  quality_report?: QualityReport | null;
}

export interface SpectrumResponse {
  file_name: string;
  frequencies_hz: number[];
  magnitudes_db: number[];
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      // Keep generic message when response is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  async uploadFiles(files: File[], options?: UploadOptions): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    // Use XHR in browser to provide upload progress callbacks.
    if (typeof XMLHttpRequest !== 'undefined') {
      return new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/api/upload`);
        xhr.responseType = 'json';

        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          if (!event.lengthComputable || !options?.onUploadProgress) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          options.onUploadProgress(progress);
        };

        xhr.onload = () => {
          let payload: unknown = xhr.response;
          if (typeof payload === 'string') {
            try {
              payload = JSON.parse(payload);
            } catch {
              payload = null;
            }
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            options?.onUploadProgress?.(100);
            resolve(payload as UploadResponse);
            return;
          }

          let detail = `Request failed with status ${xhr.status}`;
          if (
            payload &&
            typeof payload === 'object' &&
            'detail' in payload &&
            typeof (payload as { detail?: unknown }).detail === 'string'
          ) {
            detail = (payload as { detail: string }).detail;
          }
          reject(new Error(detail));
        };

        xhr.onerror = () => {
          reject(new Error('Network error while uploading files'));
        };

        xhr.send(formData);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    return parseResponse<UploadResponse>(response);
  },

  async getStatus(sessionId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/status/${encodeURIComponent(sessionId)}`);
    return parseResponse<StatusResponse>(response);
  },

  getDownloadUrl(sessionId: string): string {
    return `${API_BASE_URL}/api/download/${encodeURIComponent(sessionId)}`;
  },

  async getSpectrum(sessionId: string, fileName: string): Promise<SpectrumResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/spectrum/${encodeURIComponent(sessionId)}/${encodeURIComponent(fileName)}`,
    );
    return parseResponse<SpectrumResponse>(response);
  },
};
