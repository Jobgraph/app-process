import type { AppConfig } from './config';
import type { ExtractionResult } from './types';

interface ProcessResponse {
  result: string;
  structured: Record<string, unknown> | null;
}

export async function processInput(
  config: AppConfig,
  input: string,
): Promise<ProcessResponse> {
  const baseUrl = (window as any).__JOBGRAPH_CONFIG__ ? '' : 'https://app.jobgraph.com';
  const res = await fetch(`${baseUrl}/api/apps/${config.deploymentId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, type: 'process' }),
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function parseExtractionResult(
  response: ProcessResponse,
  fallbackTemplate: string,
): ExtractionResult {
  if (response.structured) {
    const s = response.structured;
    return {
      documentType: (s.documentType as string) || fallbackTemplate,
      documentTypeLabel: (s.documentTypeLabel as string) || fallbackTemplate,
      fields: Array.isArray(s.fields) ? s.fields : [],
    };
  }
  return {
    documentType: fallbackTemplate,
    documentTypeLabel: fallbackTemplate,
    fields: [],
  };
}
