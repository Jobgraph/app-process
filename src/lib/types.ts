export type DocumentType = 'invoice' | 'contract' | 'email' | 'cv' | 'general';
export type Confidence = 'high' | 'medium' | 'low';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: Confidence;
}

export interface ExtractionResult {
  documentType: DocumentType;
  documentTypeLabel: string;
  fields: ExtractedField[];
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  inputPreview: string;
  input: string;
  template: DocumentType;
  filename?: string;
  result: ExtractionResult | null;
  status: 'pending' | 'complete' | 'error';
  errorMessage?: string;
}
