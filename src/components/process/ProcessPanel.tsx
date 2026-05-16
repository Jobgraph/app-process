import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  FileCheck,
  Mail,
  User,
  FileSearch,
  Upload,
  Loader2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DocumentType, HistoryEntry, Confidence } from '../../lib/types';

interface ProcessPanelProps {
  activeEntry: HistoryEntry | null;
  onExtract: (input: string, template: DocumentType) => void;
  loading: boolean;
  brandColour: string;
}

const TEMPLATES: { type: DocumentType; label: string; icon: typeof Receipt }[] = [
  { type: 'invoice', label: 'Invoice', icon: Receipt },
  { type: 'contract', label: 'Contract', icon: FileCheck },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'cv', label: 'CV', icon: User },
  { type: 'general', label: 'General', icon: FileSearch },
];

function confidenceColor(c: Confidence) {
  switch (c) {
    case 'high':
      return 'text-emerald-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-red-500';
  }
}

function confidenceLabel(c: Confidence) {
  switch (c) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
}

export function ProcessPanel({
  activeEntry,
  onExtract,
  loading,
  brandColour,
}: ProcessPanelProps) {
  const [input, setInput] = useState('');
  const [template, setTemplate] = useState<DocumentType>('general');
  const [filename, setFilename] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [localFields, setLocalFields] = useState<HistoryEntry['result']>(null);
  const [trackedEntryId, setTrackedEntryId] = useState<string | null>(null);

  // Reset local fields when the active entry changes
  useEffect(() => {
    if (activeEntry?.id !== trackedEntryId) {
      setTrackedEntryId(activeEntry?.id ?? null);
      setLocalFields(null);
    }
  }, [activeEntry?.id, trackedEntryId]);

  // Use local edited fields if available, otherwise fall back to active entry result
  const result = localFields ?? activeEntry?.result ?? null;

  const handleExtract = useCallback(() => {
    if (!input.trim()) return;
    onExtract(input.trim(), template);
  }, [input, template, onExtract]);

  const handleFileSelect = useCallback(() => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = '.txt,.pdf,.doc,.docx,.eml,.csv,.json';
    el.onchange = () => {
      const file = el.files?.[0];
      if (file) setFilename(file.name);
    };
    el.click();
  }, []);

  const copyAsJSON = useCallback(() => {
    if (!result) return;
    const obj = Object.fromEntries(result.fields.map((f) => [f.label, f.value]));
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2000);
  }, [result]);

  const copyAsCSV = useCallback(() => {
    if (!result) return;
    const header = 'Field,Value,Confidence';
    const rows = result.fields.map(
      (f) => `"${f.label.replace(/"/g, '""')}","${f.value.replace(/"/g, '""')}","${f.confidence}"`,
    );
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopiedFormat('csv');
    setTimeout(() => setCopiedFormat(null), 2000);
  }, [result]);

  const exportJSON = useCallback(() => {
    if (!result) return;
    const obj = {
      documentType: result.documentType,
      documentTypeLabel: result.documentTypeLabel,
      fields: result.fields,
    };
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction-${result.documentType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const startEdit = useCallback((key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  }, []);

  const saveEdit = useCallback(() => {
    if (!result || !editingKey) return;
    const updated = {
      ...result,
      fields: result.fields.map((f) =>
        f.key === editingKey ? { ...f, value: editValue } : f,
      ),
    };
    setLocalFields(updated);
    setEditingKey(null);
    setEditValue('');
  }, [result, editingKey, editValue]);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditValue('');
  }, []);

  // Stats
  const highCount = result?.fields.filter((f) => f.confidence === 'high').length ?? 0;
  const needsReview = result?.fields.filter((f) => f.confidence !== 'high').length ?? 0;
  const totalFields = result?.fields.length ?? 0;

  // Determine if we should show the input or results view
  const showLoading = loading || activeEntry?.status === 'pending';
  const showResults = !showLoading && activeEntry?.status === 'complete' && result;
  const showError = !showLoading && activeEntry?.status === 'error';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Input Section */}
      {!showResults && !showLoading && !showError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Extract structured data</h2>
            <p className="text-sm text-muted-foreground">
              Paste a document, email, invoice, or form content below and select a template.
            </p>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a document, email, invoice, or form content..."
              rows={8}
              className="w-full bg-card border border-border rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {filename && (
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Upload className="h-3 w-3" />
                {filename}
                <button
                  onClick={() => setFilename(null)}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Template selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Document type
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setTemplate(type)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    template === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={!input.trim() || loading}
              style={{ backgroundColor: brandColour }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Extract data
            </button>
            <button
              onClick={handleFileSelect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Upload className="h-4 w-4" />
              Attach file
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {showLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: brandColour }} />
          <p className="text-sm font-medium">Extracting data...</p>
          <p className="text-xs mt-1">Analysing document structure</p>
        </motion.div>
      )}

      {/* Error state */}
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm font-medium text-destructive">Extraction failed</p>
          <p className="text-xs mt-1">{activeEntry?.errorMessage || 'An unexpected error occurred'}</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResults && result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Document type badge */}
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${brandColour}20`, color: brandColour }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.documentTypeLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalFields} fields extracted
              </span>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <CircleDot className="h-3 w-3" />
                {highCount} high confidence
              </span>
              {needsReview > 0 && (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <CircleDot className="h-3 w-3" />
                  {needsReview} needs review
                </span>
              )}
            </div>

            {/* Fields table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Field
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.fields.map((field) => (
                    <tr
                      key={field.key}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                        {field.label}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {editingKey === field.key ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button
                              onClick={saveEdit}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="group/val cursor-pointer inline-flex items-center gap-1.5"
                            onClick={() => startEdit(field.key, field.value)}
                            title="Click to edit"
                          >
                            <span>{field.value}</span>
                            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/val:opacity-100 transition-opacity" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-xs font-medium',
                            confidenceColor(field.confidence),
                          )}
                          title={confidenceLabel(field.confidence)}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {confidenceLabel(field.confidence)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyAsJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedFormat === 'json' ? 'Copied!' : 'Copy as JSON'}
              </button>
              <button
                onClick={copyAsCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedFormat === 'csv' ? 'Copied!' : 'Copy as CSV'}
              </button>
              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
