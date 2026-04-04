import { useMemo, useState } from "react";
import type { GameSummary, Screen, CountryId } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { CONTINENTS } from "../data/continents";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { getRegionLabel } from "../data/regions";
import { getCountryName } from "../lib/countryLookup";
import ZoomMap from "../components/ZoomMap";
import CountryInfoPanel from "../components/CountryInfoPanel";

interface ReviewScreenProps {
  summary: GameSummary;
  navigate: (screen: Screen) => void;
}

export default function ReviewScreen({
  summary,
  navigate,
}: ReviewScreenProps) {
  const { features } = useWorldMap();
  const [infoPanelId, setInfoPanelId] = useState<CountryId | null>(null);

  const mapData = useMemo(() => {
    if (!features.length) return { paths: [] };
    const cIds =
      summary.region === "world" ? null : CONTINENTS[summary.region];
    const filtered = cIds
      ? features.filter((f) => cIds.has(String(f.id)))
      : features;
    const geoCol: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filtered,
    };
    const proj = getProjection(summary.region, geoCol);
    return { paths: buildMapFeatures(filtered, proj) };
  }, [features, summary.region]);

  const correctIds = useMemo(() => {
    const s = new Set<CountryId>();
    for (const r of summary.results) {
      if (r.correct) s.add(r.countryId);
    }
    return s;
  }, [summary.results]);

  const wrongIds = useMemo(() => {
    const s = new Set<CountryId>();
    for (const r of summary.results) {
      if (!r.correct) s.add(r.countryId);
    }
    return s;
  }, [summary.results]);

  const missedCountries = useMemo(() => {
    const missed: CountryId[] = [];
    const seen = new Set<CountryId>();
    for (const r of summary.results) {
      if (!r.correct && !seen.has(r.countryId)) {
        seen.add(r.countryId);
        missed.push(r.countryId);
      }
    }
    return missed;
  }, [summary.results]);

  const totalSecs = Math.round(summary.totalTimeMs / 1000);

  return (
    <div className="flex flex-col h-dvh bg-[#0c1220] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 bg-black/60 border-b border-white/[.07] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            className="btn-ghost !text-xs"
            onClick={() => navigate({ kind: "menu" })}
          >
            ← Menu
          </button>
          <h2
            className={`text-xl font-black ${summary.won ? "text-correct" : "text-wrong"}`}
          >
            {summary.won ? "🏆 Victory!" : "💀 Game Over"} — Review
          </h2>
          <div className="w-16" />
        </div>
        <div className="flex gap-6 justify-center text-sm text-slate-400 flex-wrap">
          <span>
            🗺 {getRegionLabel(summary.region)}
          </span>
          <span>
            ✅ {summary.correctCount}/{summary.totalCountries} (
            {Math.round((summary.correctCount / (summary.totalCountries || 1)) * 100)}%)
          </span>
          <span>⏱ {totalSecs}s</span>
          {summary.mode === "classic" && (
            <span>❤️ {summary.livesLeft}/3</span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden bg-[#111827]">
        <ZoomMap
          paths={mapData.paths}
          correctIds={correctIds}
          wrongIds={wrongIds}
          revealId={null}
          answerRevealed={false}
          ended={true}
          practiceMode={false}
          onCountryClick={() => {}}
          onCountrySelect={setInfoPanelId}
        />
        {infoPanelId && (
          <CountryInfoPanel
            countryId={infoPanelId}
            onClose={() => setInfoPanelId(null)}
          />
        )}
      </div>

      {/* Missed countries */}
      {missedCountries.length > 0 && (
        <div className="px-4 py-3 bg-black/50 border-t border-white/[.08] shrink-0 max-h-32 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Missed Countries
          </div>
          <div className="flex gap-2 flex-wrap">
            {missedCountries.map((id) => (
              <button
                key={id}
                className="text-xs bg-red-900/40 text-red-300 px-2.5 py-1 rounded-md border border-red-500/20 cursor-pointer hover:bg-red-900/60"
                onClick={() => setInfoPanelId(id)}
              >
                {getCountryName(id)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 justify-center px-4 py-3 bg-black/50 border-t border-white/[.08] shrink-0">
        <button
          className="btn-primary !text-sm !px-5 !py-2.5"
          onClick={() =>
            navigate({ kind: "game", mode: summary.mode, region: summary.region })
          }
        >
          🔄 Play Again
        </button>
        <button
          className="btn-ghost !px-5 !py-2.5"
          onClick={() =>
            navigate({ kind: "regionSelect", mode: summary.mode })
          }
        >
          🗺 Change Map
        </button>
        <button
          className="btn-ghost !px-5 !py-2.5"
          onClick={() => navigate({ kind: "menu" })}
        >
          🏠 Menu
        </button>
      </div>
    </div>
  );
}
