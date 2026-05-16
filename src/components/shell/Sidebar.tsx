import { Plus, ScanSearch, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/utils';
import type { HistoryEntry } from '../../lib/types';

const TYPE_LABELS: Record<string, string> = {
  invoice: 'Invoice',
  contract: 'Contract',
  email: 'Email',
  cv: 'CV',
  general: 'General',
};

interface SidebarProps {
  entries: HistoryEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  entries,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card flex flex-col transition-transform duration-200 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-3 md:hidden">
          <span className="text-sm font-semibold text-foreground">History</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New extraction button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New extraction
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ScanSearch className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No extractions yet</p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {entries.map((entry) => (
                <li key={entry.id} className="group relative">
                  <button
                    onClick={() => {
                      onSelect(entry.id);
                      onClose();
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                      activeId === entry.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    )}
                  >
                    <span className="block truncate text-xs font-medium">
                      {entry.inputPreview || 'Empty input'}
                    </span>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
                        {TYPE_LABELS[entry.template] || entry.template}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {relativeTime(entry.createdAt)}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clear all */}
        {entries.length > 0 && (
          <div className="p-3 border-t border-border">
            <button
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors w-full text-center"
            >
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
