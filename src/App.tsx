import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ThemeContext } from './lib/theme';
import type { DocumentType, HistoryEntry } from './lib/types';
import { getMockExtraction } from './lib/mock';
import {
  getHistory,
  addEntry,
  updateEntry,
  deleteEntry,
  clearAll,
} from './lib/history';
import { useThemeProvider } from './hooks/useTheme';
import { useConfig } from './hooks/useConfig';
import { AppShell } from './components/shell/AppShell';
import { ProcessPanel } from './components/process/ProcessPanel';

export default function App() {
  const themeCtx = useThemeProvider();
  const { config, loading: configLoading } = useConfig();

  const [entries, setEntries] = useState<HistoryEntry[]>(getHistory);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const activeEntry = entries.find((e) => e.id === activeId) ?? null;

  const handleNew = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteEntry(id);
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      if (activeId === id) setActiveId(null);
      toast.success('Entry deleted');
    },
    [entries, activeId],
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    setEntries([]);
    setActiveId(null);
    toast.success('History cleared');
  }, []);

  const handleExtract = useCallback(
    (input: string, template: DocumentType) => {
      const id = crypto.randomUUID();
      const entry: HistoryEntry = {
        id,
        createdAt: new Date().toISOString(),
        inputPreview: input.slice(0, 80),
        input,
        template,
        result: null,
        status: 'pending',
      };

      addEntry(entry);
      setEntries((prev) => [entry, ...prev]);
      setActiveId(id);
      setExtracting(true);

      // Simulate extraction delay
      setTimeout(() => {
        try {
          const result = getMockExtraction(input, template);
          const completed: HistoryEntry = {
            ...entry,
            result,
            status: 'complete',
          };
          updateEntry(completed);
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? completed : e)),
          );
          toast.success(
            `Extracted ${result.fields.length} fields from ${result.documentTypeLabel}`,
          );
        } catch {
          const failed: HistoryEntry = {
            ...entry,
            status: 'error',
            errorMessage: 'Extraction failed. Please try again.',
          };
          updateEntry(failed);
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? failed : e)),
          );
          toast.error('Extraction failed');
        } finally {
          setExtracting(false);
        }
      }, 1000);
    },
    [],
  );

  if (configLoading || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config.isConfigured && config.deploymentId !== 'local') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-extrabold text-foreground">{config.appName}</h1>
          <p className="text-sm text-muted-foreground">This app is not yet configured. Deploy it from Jobgraph to get started.</p>
          <a href="https://app.jobgraph.com" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Go to Jobgraph</a>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={themeCtx}>
      <AppShell
        config={config}
        entries={entries}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      >
        <ProcessPanel
          activeEntry={activeEntry}
          onExtract={handleExtract}
          loading={extracting}
          brandColour={config.brandColour}
        />
      </AppShell>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card text-foreground border-border',
        }}
      />
    </ThemeContext.Provider>
  );
}
