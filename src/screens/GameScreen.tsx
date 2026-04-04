import { useEffect, useMemo, useState, useCallback } from "react";
import type { GameMode, RegionValue, Screen, CountryId } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { useGame } from "../hooks/useGame";
import { useSpacedRep } from "../hooks/useSpacedRep";
import { useGameHistory } from "../hooks/useGameHistory";
import { CONTINENTS } from "../data/continents";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { buildQueue } from "../lib/queue";
import { getCountryName } from "../lib/countryLookup";
import { getRegionLabel } from "../data/regions";
import { buildSummary } from "../state/selectors";
import ZoomMap from "../components/ZoomMap";
import GameHUD from "../components/GameHUD";
import FlashMessage from "../components/FlashMessage";
import EndOverlay from "../components/EndOverlay";
import CountryInfoPanel from "../components/CountryInfoPanel";

interface GameScreenProps {
  mode: GameMode;
  region: RegionValue;
  navigate: (screen: Screen) => void;
}

export default function GameScreen({
  mode,
  region,
  navigate,
}: GameScreenProps) {
  const { features, loading, error } = useWorldMap();
  const { state, derived, dispatch } = useGame();
  const { getAllRecords, batchUpdate } = useSpacedRep();
  const { addEntry } = useGameHistory();
  const [initialized, setInitialized] = useState(false);
  const [infoPanelId, setInfoPanelId] = useState<CountryId | null>(null);
  const [savedResult, setSavedResult] = useState(false);

  // Build paths for this region
  const mapData = useMemo(() => {
    if (!features.length) return { paths: [], availableIds: new Set<CountryId>() };
    const cIds = region === "world" ? null : CONTINENTS[region];
    const filtered = cIds
      ? features.filter((f) => cIds.has(String(f.id)))
      : features;

    const geoCol: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filtered,
    };
    const proj = getProjection(region, geoCol);
    const paths = buildMapFeatures(filtered, proj);
    const availableIds = new Set(
      paths.filter((p) => p.name).map((p) => p.id),
    );
    return { paths, availableIds };
  }, [features, region]);

  // Initialize game when map is ready
  useEffect(() => {
    if (!mapData.availableIds.size || initialized) return;
    const srRecords = getAllRecords();
    const queue = buildQueue(region, mapData.availableIds, srRecords);
    dispatch({
      type: "INIT_GAME",
      mode,
      region,
      queue,
    });
    setInitialized(true);
    setSavedResult(false);
  }, [mapData.availableIds, initialized, mode, region, dispatch, getAllRecords]);

  // Auto-clear flash
  useEffect(() => {
    if (!state.flash) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 1800);
    return () => clearTimeout(t);
  }, [state.flash, dispatch]);

  // Auto-clear wrong highlight (classic mode)
  useEffect(() => {
    if (!state.wrongClickId || mode === "practice") return;
    const t = setTimeout(
      () => dispatch({ type: "CLEAR_WRONG_HIGHLIGHT" }),
      2000,
    );
    return () => clearTimeout(t);
  }, [state.wrongClickId, mode, dispatch]);

  // Save result when game ends
  useEffect(() => {
    if (!state.finished || savedResult) return;
    setSavedResult(true);
    const summary = buildSummary(state, region);

    // Update spaced rep records
    batchUpdate(
      state.results.map((r) => ({
        countryId: r.countryId,
        correct: r.correct,
      })),
    );

    // Add history entry
    addEntry({
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      region: getRegionLabel(region),
      regionValue: region,
      mode,
      found: summary.correctCount,
      total: summary.totalCountries,
      livesLeft: summary.livesLeft,
      won: summary.won,
      secs: Math.round(summary.totalTimeMs / 1000),
      pct: Math.round(
        (summary.correctCount / (summary.totalCountries || 1)) * 100,
      ),
    });
  }, [state.finished, savedResult, state, region, mode, batchUpdate, addEntry]);

  const handleCountryClick = useCallback(
    (id: CountryId) => {
      dispatch({ type: "CLICK_COUNTRY", countryId: id, timestamp: Date.now() });
    },
    [dispatch],
  );

  const handleCountrySelect = useCallback(
    (id: CountryId) => {
      setInfoPanelId(id);
    },
    [],
  );

  const handlePlayAgain = () => {
    setInitialized(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-950">
        <div className="text-5xl">😕</div>
        <div className="text-red-400 text-xl font-bold mt-3">
          Failed to load map data
        </div>
      </div>
    );
  }

  const targetName = derived.currentCountryId
    ? getCountryName(derived.currentCountryId)
    : "";

  const mapReady = !loading && initialized && mapData.paths.length > 0;

  return (
    <div className="flex flex-col h-dvh bg-[#0c1220] overflow-hidden">
      <GameHUD
        targetName={targetName}
        currentIndex={state.currentIndex}
        totalCountries={state.queue.length}
        lives={state.lives}
        mode={mode}
        finished={state.finished}
        won={derived.correctCount >= state.queue.length}
        correctCount={derived.correctCount}
        progress={derived.progress}
        onBack={() => navigate({ kind: "regionSelect", mode })}
      />

      {state.flash && <FlashMessage type={state.flash.type} />}

      <div className="flex-1 relative overflow-hidden bg-[#111827]">
        {!mapReady ? (
          <div className="flex items-center justify-center h-full text-slate-600">
            Loading map...
          </div>
        ) : (
          <ZoomMap
            paths={mapData.paths}
            correctIds={derived.correctSet}
            wrongIds={derived.wrongSet}
            revealId={state.wrongClickId}
            answerRevealed={state.answerRevealed}
            ended={state.finished}
            practiceMode={mode === "practice"}
            onCountryClick={handleCountryClick}
            onCountrySelect={handleCountrySelect}
          />
        )}

        {/* Country info panel (practice mode or post-game) */}
        {infoPanelId && (
          <CountryInfoPanel
            countryId={infoPanelId}
            onClose={() => setInfoPanelId(null)}
          />
        )}
      </div>

      {/* Practice mode controls */}
      {mode === "practice" && !state.finished && mapReady && (
        <div className="flex gap-2.5 justify-center px-4 py-3 bg-black/40 border-t border-white/[.08] shrink-0">
          {!state.answerRevealed ? (
            <button
              className="btn-ghost !px-5 !py-2.5"
              onClick={() => dispatch({ type: "REVEAL_ANSWER" })}
            >
              👁 Show Answer
            </button>
          ) : (
            <button
              className="btn-primary !text-sm !px-5 !py-2.5"
              onClick={() => dispatch({ type: "NEXT_COUNTRY" })}
            >
              Next →
            </button>
          )}
          <button
            className="btn-ghost !px-4 !py-2.5 !text-xs"
            onClick={() => setInfoPanelId(derived.currentCountryId)}
          >
            ℹ️ Country Info
          </button>
        </div>
      )}

      {state.finished && (
        <EndOverlay
          onPlayAgain={handlePlayAgain}
          onChangeMap={() => navigate({ kind: "regionSelect", mode })}
          onMainMenu={() => navigate({ kind: "menu" })}
        />
      )}
    </div>
  );
}
