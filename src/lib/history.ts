import type { HistoryEntry } from './types';

const KEY = 'jg-process-history';
const MAX = 50;

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
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
  if (idx !== -1) all[idx] = e;
  else all.unshift(e);
  save(all);
}

export function deleteEntry(id: string) {
  save(getHistory().filter((e) => e.id !== id));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}
