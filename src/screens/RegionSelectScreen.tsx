import { useState, useEffect } from "react";
import type { GameMode, RegionValue, Screen, Difficulty } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { CONTINENTS } from "../data/continents";
import { DIFFICULTY } from "../data/difficulty";
import { getRegionLabel } from "../data/regions";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { DIFFICULTY_PRESETS, getDefaultDifficulty } from "../lib/difficultyPresets";
import RegionGrid from "../components/RegionGrid";

interface RegionSelectScreenProps {
  mode: GameMode;
  navigate: (screen: Screen) => void;
}

export default function RegionSelectScreen({
  mode,
  navigate,
}: RegionSelectScreenProps) {
  const { features, loading } = useWorldMap();
  const [region, setRegion] = useState<RegionValue | null>(null);
  const [countryCount, setCountryCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(getDefaultDifficulty);

  useEffect(() => {
    if (!region || !features.length) {
      setMapReady(false);
      return;
    }
    const cIds = region === "world" ? null : CONTINENTS[region];
    const filtered = cIds
      ? features.filter((f) => cIds.has(String(f.id)))
      : features;

    const geoCol: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filtered,
    };
    const proj = getProjection(region, geoCol);
    const mapFeats = buildMapFeatures(filtered, proj);
    const availableIds = new Set(
      mapFeats.filter((p) => p.name).map((p) => p.id),
    );
    const count = DIFFICULTY[region].filter((id) => availableIds.has(id)).length;
    setCountryCount(count);
    setMapReady(true);
  }, [region, features]);

  const handleSelect = (id: RegionValue) => {
    setRegion(id);
  };

  const startGame = () => {
    if (!region) return;
    navigate({ kind: "game", mode, region, difficulty });
  };

  const preset = DIFFICULTY_PRESETS[difficulty];

  return (
    <div
      className="min-h-dvh font-sans text-slate-200 flex flex-col items-center justify-center px-4 py-5"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0f1d35 50%, #111827 100%)",
      }}
    >
      <button
        onClick={() => navigate({ kind: "menu" })}
        className="btn-ghost mb-3"
      >
        ← Back to Menu
      </button>

      <h1 className="gradient-text text-[clamp(24px,4vw,40px)] font-black mt-3 mb-1 text-center">
        Choose Your Map
      </h1>
      <p className="text-slate-500 text-[15px] mb-5 text-center">
        {mode === "practice" && "Practice mode — no lives, learn at your pace"}
        {mode === "classic" && "Select a region to start"}
        {mode === "timed" && "Race the clock — find as many countries as you can!"}
        {mode === "speedrun" && "Speed run — find every country as fast as possible!"}
        {mode === "flags" && "Identify countries by their flag"}
        {mode === "capitals" && "Find countries by their capital city"}
      </p>

      <RegionGrid selected={region} onSelect={handleSelect} />

      {region && (
        <div className="mt-6 text-center w-full max-w-[440px]">
          {loading || !mapReady ? (
            <div className="text-slate-500 text-[15px]">⏳ Loading map data...</div>
          ) : (
            <>
              {/* Difficulty selector */}
              {mode !== "practice" && mode !== "speedrun" && (
                <div className="flex gap-2 justify-center mb-5">
                  {(Object.entries(DIFFICULTY_PRESETS) as [Difficulty, typeof preset][]).map(
                    ([key, p]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
                          difficulty === key
                            ? key === "easy"
                              ? "bg-green-500/25 text-green-400"
                              : key === "hard"
                                ? "bg-red-500/25 text-red-400"
                                : "bg-blue-500/25 text-blue-400"
                            : "bg-white/[.06] text-slate-500 hover:bg-white/[.1]"
                        }`}
                      >
                        {p.emoji} {p.label}
                      </button>
                    ),
                  )}
                </div>
              )}

              <div className="text-slate-400 mb-1.5 text-[15px]">
                <span className="text-sky-400 font-bold">
                  {getRegionLabel(region)}
                </span>{" "}
                —{" "}
                <span className="text-slate-200 font-semibold">
                  {countryCount} countries
                </span>{" "}
                to find
              </div>
              <p className="text-slate-600 text-[13px] mb-5">
                {(mode === "classic" || mode === "flags" || mode === "capitals") &&
                  `${preset.lives} wrong answers ends the game. Scroll to zoom, drag to pan!`}
                {mode === "practice" && "No penalties — take your time and learn!"}
                {mode === "timed" && `${preset.timedDuration}s timer. Wrong answers cost 5 seconds!`}
                {mode === "speedrun" && "No penalty for wrong clicks — just find them all fast!"}
              </p>
              <button
                className="btn-primary !text-xl !px-11 !py-4"
                onClick={startGame}
              >
                🚀 Start Game!
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
