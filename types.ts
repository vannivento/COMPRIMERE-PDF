export interface PDFFile {
  file: File;
  name: string;
  size: number; // in bytes
  url: string;
}

export enum CompressionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface CompressionResult {
  blob: Blob;
  size: number;
  url: string;
  compressionRatio: number;
}
