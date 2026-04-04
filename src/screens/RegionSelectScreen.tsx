import { useState, useEffect } from "react";
import type { GameMode, RegionValue, Screen } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { CONTINENTS } from "../data/continents";
import { DIFFICULTY } from "../data/difficulty";
import { getRegionLabel } from "../data/regions";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
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
  const [antMsg, setAntMsg] = useState(false);
  const [countryCount, setCountryCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);

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

  const handleSelect = (id: RegionValue | "antarctica") => {
    if (id === "antarctica") {
      setAntMsg(true);
      setRegion(null);
      return;
    }
    setAntMsg(false);
    setRegion(id);
  };

  const startGame = () => {
    if (!region) return;
    navigate({ kind: "game", mode, region });
  };

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
      <p className="text-slate-500 text-[15px] mb-7 text-center">
        {mode === "practice" && "Practice mode — no lives, learn at your pace"}
        {mode === "classic" && "Select a region to start"}
        {mode === "timed" && "Race the clock — find as many countries as you can!"}
        {mode === "speedrun" && "Speed run — find every country as fast as possible!"}
        {mode === "flags" && "Identify countries by their flag"}
        {mode === "capitals" && "Find countries by their capital city"}
      </p>

      <RegionGrid selected={region} onSelect={handleSelect} />

      {antMsg && (
        <div className="mt-6 px-10 py-7 bg-red-500/10 border-2 border-red-500/35 rounded-2xl text-center max-w-[360px]">
          <div className="text-4xl mb-2">🙄</div>
          <div className="text-3xl font-black tracking-widest text-red-500 uppercase">
            Lame Loser
          </div>
          <p className="text-red-300 mt-2.5 text-[15px]">
            Antarctica has no countries.
            <br />
            Pick a real map, genius.
          </p>
        </div>
      )}

      {region && !antMsg && (
        <div className="mt-8 text-center">
          {loading || !mapReady ? (
            <div className="text-slate-500 text-[15px]">⏳ Loading map data...</div>
          ) : (
            <>
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
                  "3 wrong answers ends the game. Scroll to zoom, drag to pan!"}
                {mode === "practice" && "No penalties — take your time and learn!"}
                {mode === "timed" && "Wrong answers cost 5 seconds. Scroll to zoom, drag to pan!"}
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
