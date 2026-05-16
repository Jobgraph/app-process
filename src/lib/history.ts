import type { HistoryEntry } from './types';

const KEY = 'jg-process-history';
const MAX = 50;
const STALE_PENDING_MS = 5 * 60 * 1000; // 5 minutes

export function getHistory(): HistoryEntry[] {
  try {
    const entries: HistoryEntry[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    let changed = false;
    const now = Date.now();
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].status === 'pending') {
        const age = now - new Date(entries[i].createdAt).getTime();
        if (age > STALE_PENDING_MS) {
          entries[i] = { ...entries[i], status: 'error', errorMessage: 'Extraction timed out' };
          changed = true;
        }
      }
    }
    if (changed) {
      localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
    }
    return entries;
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
}

export function addEntry(e: HistoryEntry) {
  const all = getHistory();
  all.unshift(e);
  save(all);
}

export function updateEntry(e: HistoryEntry) {
  const all = getHistory();
  const idx = all.findIndex((x) => x.id === e.id);
  if (idx === -1) return;  // was deleted, don't re-add
  all[idx] = e;
  save(all);
}

export function deleteEntry(id: string) {
  save(getHistory().filter((e) => e.id !== id));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}
