/**
 * Type definitions for Smart Personal Photo Organizer
 * 
 * All types for photo classification, privacy scoring, and metadata
 */

export enum PhotoCategory {
  Document = 'document',
  Receipt = 'receipt',
  Screenshot = 'screenshot',
  Note = 'note',
  PersonalPhoto = 'personal_photo',
  Unknown = 'unknown',
}

export enum PrivacyRiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface PrivacyRisk {
  level: PrivacyRiskLevel;
  reasons: string[];
  detectedElements: string[];
}

export interface PhotoClassification {
  category: PhotoCategory;
  confidence: number;
  explanation: string;
}

export interface MemoryQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

export interface MemoryLock {
  enabled: boolean;
  questions: MemoryQuestion[];
  createdAt: Date;
  failedAttempts: number;
}

export interface PhotoMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  dateAdded: Date;
  dataUrl: string; // Base64 encoded image
  classification: PhotoClassification | null;
  privacyRisk: PrivacyRisk | null;
  imageWidth: number;
  imageHeight: number;
  // Search metadata
  textContent?: string; // Extracted text from OCR
  timestamp?: Date; // File creation timestamp if available
  // Memory Lock - Privacy-first authentication
  memoryLock?: MemoryLock;
  isLocked?: boolean; // Quick access flag
}

export interface SearchQuery {
  query: string;
  filters?: {
    category?: PhotoCategory;
    privacyLevel?: PrivacyRiskLevel;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface ClassificationProgress {
  total: number;
  current: number;
  currentFile: string;
}
