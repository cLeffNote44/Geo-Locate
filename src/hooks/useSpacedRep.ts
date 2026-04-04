import { useRef, useCallback } from "react";
import type { CountryId } from "../types";
import type { SpacedRepRecord } from "../types";
import { load, save } from "../lib/storage";

const SR_KEY = "geo-sr";

type SRData = Record<CountryId, SpacedRepRecord>;

export function useSpacedRep() {
  const dataRef = useRef<SRData>(load<SRData>(SR_KEY, {}));

  const getRecord = useCallback(
    (id: CountryId): SpacedRepRecord | undefined => {
      return dataRef.current[id];
    },
    [],
  );

  const getAllRecords = useCallback((): SRData => {
    return { ...dataRef.current };
  }, []);

  const updateRecord = useCallback(
    (id: CountryId, wasCorrect: boolean) => {
      const existing = dataRef.current[id] ?? {
        countryId: id,
        attempts: 0,
        correct: 0,
        lastSeen: 0,
      };

      dataRef.current[id] = {
        ...existing,
        attempts: existing.attempts + 1,
        correct: existing.correct + (wasCorrect ? 1 : 0),
        lastSeen: Date.now(),
      };

      save(SR_KEY, dataRef.current);
    },
    [],
  );

  const batchUpdate = useCallback(
    (results: { countryId: CountryId; correct: boolean }[]) => {
      for (const r of results) {
        const existing = dataRef.current[r.countryId] ?? {
          countryId: r.countryId,
          attempts: 0,
          correct: 0,
          lastSeen: 0,
        };

        dataRef.current[r.countryId] = {
          ...existing,
          attempts: existing.attempts + 1,
          correct: existing.correct + (r.correct ? 1 : 0),
          lastSeen: Date.now(),
        };
      }

      save(SR_KEY, dataRef.current);
    },
    [],
  );

  return { getRecord, getAllRecords, updateRecord, batchUpdate };
}
