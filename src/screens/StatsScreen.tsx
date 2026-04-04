import { useMemo, useState } from "react";
import type { Screen, CountryId, RegionValue } from "../types";
import type { HistoryEntry, SpacedRepRecord, MasteryLevel } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { useSpacedRep } from "../hooks/useSpacedRep";
import { useAchievements } from "../hooks/useAchievements";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useStreak } from "../hooks/useStreak";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { getCountryName } from "../lib/countryLookup";
import { getMasteryLevel } from "../lib/queue";
import { getRegionLabel } from "../data/regions";
import { getDailyHistory } from "../lib/daily";
import AchievementGrid from "../components/AchievementGrid";
import MiniBarChart from "../components/MiniBarChart";
import TrendLine from "../components/TrendLine";

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

const REGION_TABS: RegionValue[] = ["world", "europe", "asia", "africa", "northAmerica", "southAmerica", "oceania"];

const REGION_BAR_COLORS: Record<RegionValue, string> = {
  world: "#3b82f6",
  europe: "#8b5cf6",
  asia: "#ef4444",
  africa: "#f97316",
  northAmerica: "#22c55e",
  southAmerica: "#06b6d4",
  oceania: "#eab308",
};

export default function StatsScreen({ history, navigate }: StatsScreenProps) {
  const { features } = useWorldMap();
  const { getAllRecords } = useSpacedRep();
  const { achievements } = useAchievements();
  const { getRegionScores } = useLeaderboard();
  const { currentStreak, longestStreak } = useStreak();
  const [lbRegion, setLbRegion] = useState<RegionValue>("world");

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

  // Accuracy by region
  const regionAccuracy = useMemo(() => {
    const regionData: Record<RegionValue, { correct: number; total: number }> = {
      world: { correct: 0, total: 0 },
      europe: { correct: 0, total: 0 },
      asia: { correct: 0, total: 0 },
      africa: { correct: 0, total: 0 },
      northAmerica: { correct: 0, total: 0 },
      southAmerica: { correct: 0, total: 0 },
      oceania: { correct: 0, total: 0 },
    };
    for (const h of history) {
      if (regionData[h.regionValue]) {
        regionData[h.regionValue].correct += h.found;
        regionData[h.regionValue].total += h.total;
      }
    }
    return REGION_TABS
      .filter((r) => regionData[r].total > 0)
      .map((r) => ({
        label: getRegionLabel(r),
        value: Math.round((regionData[r].correct / regionData[r].total) * 100),
        color: REGION_BAR_COLORS[r],
      }));
  }, [history]);

  // Accuracy trend (last 20 games)
  const accuracyTrend = useMemo(() => {
    return history
      .slice(0, 20)
      .reverse()
      .map((h) => h.pct);
  }, [history]);

  // Best streak from history
  const bestStreak = useMemo(() => {
    if (history.length === 0) return { value: 0, date: "" };
    const best = history.reduce((a, b) => (a.maxStreak >= b.maxStreak ? a : b));
    return { value: best.maxStreak, date: best.date };
  }, [history]);

  // Average time per country by region
  const avgTimeByRegion = useMemo(() => {
    const regionTimes: Record<RegionValue, { totalSecs: number; totalCountries: number }> = {
      world: { totalSecs: 0, totalCountries: 0 },
      europe: { totalSecs: 0, totalCountries: 0 },
      asia: { totalSecs: 0, totalCountries: 0 },
      africa: { totalSecs: 0, totalCountries: 0 },
      northAmerica: { totalSecs: 0, totalCountries: 0 },
      southAmerica: { totalSecs: 0, totalCountries: 0 },
      oceania: { totalSecs: 0, totalCountries: 0 },
    };
    for (const h of history) {
      if (regionTimes[h.regionValue]) {
        regionTimes[h.regionValue].totalSecs += h.secs;
        regionTimes[h.regionValue].totalCountries += h.found;
      }
    }
    return REGION_TABS
      .filter((r) => regionTimes[r].totalCountries > 0)
      .map((r) => ({
        label: getRegionLabel(r),
        value: Math.round(regionTimes[r].totalSecs / regionTimes[r].totalCountries * 10) / 10,
        color: REGION_BAR_COLORS[r],
      }));
  }, [history]);

  // Most improved countries (biggest accuracy jump from first to recent)
  const mostImproved = useMemo(() => {
    const entries = Object.entries(srData) as [CountryId, SpacedRepRecord][];
    return entries
      .filter(([, r]) => r.attempts >= 4 && r.correct > 0)
      .map(([id, r]) => ({
        id,
        name: getCountryName(id),
        accuracy: Math.round((r.correct / r.attempts) * 100),
        attempts: r.attempts,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10);
  }, [srData]);

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

  // Daily challenge history
  const dailyHistory = useMemo(() => getDailyHistory().slice(0, 10), []);

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

        {/* Streaks & best streak */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Current Streak"
            value={currentStreak > 0 ? `🔥 ${currentStreak}d` : "—"}
          />
          <StatCard
            label="Longest Streak"
            value={longestStreak > 0 ? `${longestStreak}d` : "—"}
          />
          <StatCard
            label="Best Game Streak"
            value={bestStreak.value >= 3 ? `🔥 ${bestStreak.value}` : String(bestStreak.value)}
          />
        </div>

        {/* Accuracy by region */}
        {regionAccuracy.length > 0 && (
          <div className="card mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Accuracy by Region
            </div>
            <MiniBarChart data={regionAccuracy} maxValue={100} suffix="%" />
          </div>
        )}

        {/* Accuracy trend */}
        {accuracyTrend.length > 0 && (
          <div className="card mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Accuracy Trend (Last {accuracyTrend.length} Games)
            </div>
            <TrendLine values={accuracyTrend} color="#8b5cf6" />
          </div>
        )}

        {/* Average time per country */}
        {avgTimeByRegion.length > 0 && (
          <div className="card mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Avg. Time per Country (seconds)
            </div>
            <MiniBarChart data={avgTimeByRegion} suffix="s" />
          </div>
        )}

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

        {/* Daily challenge history */}
        {dailyHistory.length > 0 && (
          <div className="card mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              📅 Daily Challenge History
            </div>
            <div className="space-y-1.5">
              {dailyHistory.map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[.03]"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${d.won ? "text-green-400" : "text-red-400"}`}>
                      {d.won ? "🏆" : "💀"}
                    </span>
                    <span className="text-sm text-slate-300">
                      {d.correct}/{d.total} ({d.pct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="text-amber-400 font-bold">{d.score.toLocaleString()} pts</span>
                    <span>{d.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="mb-8">
          <AchievementGrid achievements={achievements} />
        </div>

        {/* Leaderboard */}
        <div className="card mb-8">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Leaderboard — Top Scores
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {REGION_TABS.map((r) => (
              <button
                key={r}
                onClick={() => setLbRegion(r)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer border-none transition-colors ${
                  lbRegion === r
                    ? "bg-blue-500/25 text-sky-400"
                    : "bg-white/[.05] text-slate-500 hover:bg-white/[.1]"
                }`}
              >
                {getRegionLabel(r)}
              </button>
            ))}
          </div>
          {(() => {
            const scores = getRegionScores(lbRegion);
            if (scores.length === 0) {
              return (
                <div className="text-slate-600 text-center py-4 text-sm">
                  No scores yet for {getRegionLabel(lbRegion)}
                </div>
              );
            }
            return (
              <div className="space-y-1.5">
                {scores.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[.03]"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black w-6 text-center ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-slate-500"}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-amber-400">
                        {s.score.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{s.pct}%</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Most improved countries */}
        {mostImproved.length > 0 && (
          <div className="card mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              🌟 Strongest Countries (min 4 attempts)
            </div>
            <div className="space-y-2">
              {mostImproved.map((c) => (
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
                          background: "#22c55e",
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-green-400 min-w-[2.5rem] text-right">
                      {c.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
