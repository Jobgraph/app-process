import { useState, type ReactNode } from 'react';
import type { AppConfig } from '../../lib/config';
import type { HistoryEntry } from '../../lib/types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  config: AppConfig;
  entries: HistoryEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  children: ReactNode;
}

export function AppShell({
  config,
  entries,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header config={config} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          entries={entries}
          activeId={activeId}
          onSelect={onSelect}
          onNew={onNew}
          onDelete={onDelete}
          onClearAll={onClearAll}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
