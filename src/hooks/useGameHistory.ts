import { useState, useCallback } from "react";
import type { HistoryEntry } from "../types";
import { load, save } from "../lib/storage";

const HISTORY_KEY = "geo-hist";
const MAX_ENTRIES = 50;

export function useGameHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    load<HistoryEntry[]>(HISTORY_KEY, []),
  );

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      save(HISTORY_KEY, next);
      return next;
    });
  }, []);

  return { history, addEntry };
}
