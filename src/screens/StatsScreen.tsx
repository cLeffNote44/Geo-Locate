import { useMemo } from "react";
import type { Screen, CountryId } from "../types";
import type { HistoryEntry, SpacedRepRecord, MasteryLevel } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { useSpacedRep } from "../hooks/useSpacedRep";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { getCountryName } from "../lib/countryLookup";
import { getMasteryLevel } from "../lib/queue";

interface StatsScreenProps {
  history: HistoryEntry[];
  navigate: (screen: Screen) => void;
}

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  new: "#374151",
  learning: "#ef4444",
  familiar: "#f97316",
  known: "#eab308",
  mastered: "#22c55e",
};

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  new: "New",
  learning: "Learning",
  familiar: "Familiar",
  known: "Known",
  mastered: "Mastered",
};

export default function StatsScreen({ history, navigate }: StatsScreenProps) {
  const { features } = useWorldMap();
  const { getAllRecords } = useSpacedRep();

  const srData = useMemo(() => getAllRecords(), [getAllRecords]);

  const masteryMap = useMemo(() => {
    const m = new Map<CountryId, MasteryLevel>();
    for (const [id, rec] of Object.entries(srData)) {
      m.set(id, getMasteryLevel(rec as SpacedRepRecord));
    }
    return m;
  }, [srData]);

  const stats = useMemo(() => {
    let totalCorrect = 0;
    let totalAttempts = 0;
    const totalGames = history.length;
    const totalTimeSecs = history.reduce((s, h) => s + h.secs, 0);

    for (const rec of Object.values(srData) as SpacedRepRecord[]) {
      totalCorrect += rec.correct;
      totalAttempts += rec.attempts;
    }

    let countriesMastered = 0;
    for (const level of masteryMap.values()) {
      if (level === "mastered") countriesMastered++;
    }

    return {
      totalGames,
      totalCorrect,
      totalAttempts,
      totalTimeSecs,
      countriesMastered,
      overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    };
  }, [history, srData, masteryMap]);

  // Weakest countries
  const weakest = useMemo(() => {
    const entries = Object.entries(srData) as [CountryId, SpacedRepRecord][];
    return entries
      .filter(([, r]) => r.attempts >= 2)
      .map(([id, r]) => ({
        id,
        name: getCountryName(id),
        accuracy: Math.round((r.correct / r.attempts) * 100),
        attempts: r.attempts,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 15);
  }, [srData]);

  // Build world mastery map paths
  const worldPaths = useMemo(() => {
    if (!features.length) return [];
    const geoCol: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features,
    };
    const proj = getProjection("world", geoCol);
    return buildMapFeatures(features, proj);
  }, [features]);

  const masteryCountsByLevel = useMemo(() => {
    const counts: Record<MasteryLevel, number> = {
      new: 0,
      learning: 0,
      familiar: 0,
      known: 0,
      mastered: 0,
    };
    for (const level of masteryMap.values()) {
      counts[level]++;
    }
    // Count countries not in srData as "new"
    const trackedCount = Object.keys(srData).length;
    counts.new = Math.max(0, worldPaths.filter((p) => p.name).length - trackedCount) + counts.new;
    return counts;
  }, [masteryMap, srData, worldPaths]);

  return (
    <div
      className="min-h-dvh font-sans text-slate-200 overflow-y-auto"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0f1d35 50%, #111827 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            className="btn-ghost"
            onClick={() => navigate({ kind: "menu" })}
          >
            ← Back
          </button>
          <h1 className="gradient-text text-3xl font-black">
            📊 Statistics
          </h1>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Games Played" value={String(stats.totalGames)} />
          <StatCard label="Overall Accuracy" value={`${stats.overallAccuracy}%`} />
          <StatCard label="Countries Mastered" value={String(stats.countriesMastered)} />
          <StatCard
            label="Time Played"
            value={
              stats.totalTimeSecs >= 3600
                ? `${Math.floor(stats.totalTimeSecs / 3600)}h ${Math.round((stats.totalTimeSecs % 3600) / 60)}m`
                : `${Math.round(stats.totalTimeSecs / 60)}m`
            }
          />
        </div>

        {/* Mastery legend */}
        <div className="flex gap-4 flex-wrap mb-4">
          {(Object.keys(MASTERY_COLORS) as MasteryLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: MASTERY_COLORS[level] }}
              />
              {MASTERY_LABELS[level]} ({masteryCountsByLevel[level]})
            </div>
          ))}
        </div>

        {/* Mastery world map */}
        <div className="card mb-8">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            World Mastery Map
          </div>
          <svg viewBox="0 0 800 490" className="w-full rounded-lg">
            <rect width="800" height="490" fill="#1a2744" />
            {worldPaths.map((p) => {
              const level = masteryMap.get(p.id) ?? "new";
              return (
                <path
                  key={p.id}
                  d={p.d}
                  fill={MASTERY_COLORS[level]}
                  stroke="#2a3a5a"
                  strokeWidth={0.3}
                  strokeLinejoin="round"
                  opacity={0.85}
                >
                  <title>{p.name ?? p.id}</title>
                </path>
              );
            })}
          </svg>
        </div>

        {/* Weakest countries */}
        <div className="card">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Weakest Countries (min 2 attempts)
          </div>
          {weakest.length === 0 ? (
            <div className="text-slate-600 text-center py-5 text-sm">
              Play some games to see your weakest countries!
            </div>
          ) : (
            <div className="space-y-2">
              {weakest.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[.03]"
                >
                  <span className="text-sm font-semibold text-slate-200">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {c.attempts} attempts
                    </span>
                    <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.accuracy}%`,
                          background:
                            c.accuracy < 40
                              ? "#ef4444"
                              : c.accuracy < 70
                                ? "#f97316"
                                : "#eab308",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold min-w-[2.5rem] text-right"
                      style={{
                        color:
                          c.accuracy < 40
                            ? "#ef4444"
                            : c.accuracy < 70
                              ? "#f97316"
                              : "#eab308",
                      }}
                    >
                      {c.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
