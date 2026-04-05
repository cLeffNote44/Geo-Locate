import { useEffect, useMemo, useState, useCallback, useReducer, useRef } from "react";
import type { RegionValue, Screen, CountryId, Difficulty } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { useSound } from "../hooks/useSound";
import { useStreak } from "../hooks/useStreak";
import { useGameHistory } from "../hooks/useGameHistory";
import { CONTINENTS } from "../data/continents";
import { DIFFICULTY } from "../data/difficulty";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { getCountryName, getCountryInfo } from "../lib/countryLookup";
import { getRegionLabel } from "../data/regions";
import { territoryReducer, initialTerritoryState } from "../state/territoryReducer";
import ZoomMap from "../components/ZoomMap";
import TerritoryBar from "../components/TerritoryBar";
import FlashMessage from "../components/FlashMessage";
import Confetti from "../components/Confetti";

const AI_ACCURACY: Record<Difficulty, number> = {
  easy: 0.45,
  normal: 0.65,
  hard: 0.85,
};

const AI_TURN_DELAY = 1200;

interface TerritoryScreenProps {
  region: RegionValue;
  difficulty: Difficulty;
  navigate: (screen: Screen) => void;
}

export default function TerritoryScreen({
  region,
  difficulty,
  navigate,
}: TerritoryScreenProps) {
  const { features, loading, error } = useWorldMap();
  const [state, dispatch] = useReducer(territoryReducer, initialTerritoryState);
  const { muted, toggleMute, playCorrect, playWrong, playWin, playLose } = useSound();
  const { recordPlay } = useStreak();
  const { addEntry } = useGameHistory();
  const [initialized, setInitialized] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const savedRef = useRef(false);

  // Build paths for this region
  const mapData = useMemo(() => {
    if (!features.length) return { paths: [], availableIds: new Set<CountryId>(), areaMap: {} as Record<CountryId, number> };
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

    // Build area map from countryInfo
    const areaMap: Record<CountryId, number> = {};
    for (const id of availableIds) {
      const info = getCountryInfo(id);
      areaMap[id] = info?.area_km2 ?? 10000;
    }

    return { paths, availableIds, areaMap };
  }, [features, region]);

  // Initialize game
  useEffect(() => {
    if (!mapData.availableIds.size || initialized) return;
    const queue = DIFFICULTY[region].filter((id) => mapData.availableIds.has(id));
    dispatch({
      type: "INIT",
      region,
      difficulty,
      queue,
      areas: mapData.areaMap,
    });
    setInitialized(true);
    savedRef.current = false;
  }, [mapData.availableIds, initialized, region, difficulty]);

  // AI turn logic
  useEffect(() => {
    if (state.turn !== "ai" || state.finished || !state.currentTarget) return;

    const timer = setTimeout(() => {
      const correct = Math.random() < AI_ACCURACY[difficulty];

      // Find a bonus neighbor to claim if player got it wrong
      let bonusClaimId: CountryId | undefined;
      if (correct) {
        const target = state.currentTarget!;
        // Find an adjacent unclaimed country in the queue
        const targetIdx = state.queue.indexOf(target);
        for (let d = 1; d <= 3; d++) {
          const nearId = state.queue[targetIdx + d] ?? state.queue[targetIdx - d];
          if (nearId && state.ownership[nearId] === "unclaimed") {
            bonusClaimId = nearId;
            break;
          }
        }
      }

      dispatch({ type: "AI_TURN_RESULT", correct, bonusClaimId });
    }, AI_TURN_DELAY);

    return () => clearTimeout(timer);
  }, [state.turn, state.finished, state.currentTarget, difficulty, state.queue, state.ownership]);

  // Sound effects on flash
  useEffect(() => {
    if (!state.flash) return;
    if (state.flash.type === "correct") {
      playCorrect();
    } else if (state.flash.type === "wrong") {
      playWrong();
    } else if (state.flash.type === "ai-claim") {
      playWrong();
    }
    const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 1400);
    return () => clearTimeout(t);
  }, [state.flash, playCorrect, playWrong]);

  // Game end
  useEffect(() => {
    if (!state.finished || savedRef.current) return;
    savedRef.current = true;
    recordPlay();

    const playerWon = state.playerArea > state.aiArea;
    if (playerWon) {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      playLose();
    }

    addEntry({
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      region: getRegionLabel(region),
      regionValue: region,
      mode: "territory",
      difficulty,
      found: state.playerCountries,
      total: state.totalCountries,
      livesLeft: 0,
      won: playerWon,
      secs: Math.round((Date.now() - state.roundStartedAt) / 1000),
      pct: Math.round((state.playerArea / (state.totalArea || 1)) * 100),
      score: state.playerArea,
      maxStreak: state.maxStreak,
      hintsUsed: 0,
    });
  }, [state.finished]);

  const handleCountryClick = useCallback(
    (id: CountryId) => {
      if (state.turn !== "player") return;
      dispatch({ type: "CLICK_COUNTRY", countryId: id });
    },
    [state.turn],
  );

  const handleShare = useCallback(async () => {
    const playerPct = Math.round((state.playerArea / (state.totalArea || 1)) * 100);
    const aiPct = Math.round((state.aiArea / (state.totalArea || 1)) * 100);
    const playerWon = state.playerArea > state.aiArea;
    const text = [
      `⚔️ GeoChallenge Territory Wars — ${getRegionLabel(region)}`,
      `${playerWon ? "🏆 Victory" : "💀 Defeat"} | 🛡 ${playerPct}% vs 🤖 ${aiPct}%`,
      `📊 ${state.playerCountries}/${state.totalCountries} countries claimed | 🔥 ${state.maxStreak} streak`,
      `Play at leffel.io/games/geo-challenge`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, [state, region]);

  // Build color map for ZoomMap
  const territoryCorrectIds = useMemo(() => {
    const s = new Set<CountryId>();
    for (const [id, owner] of Object.entries(state.ownership)) {
      if (owner === "player") s.add(id);
    }
    return s;
  }, [state.ownership]);

  const territoryWrongIds = useMemo(() => {
    const s = new Set<CountryId>();
    for (const [id, owner] of Object.entries(state.ownership)) {
      if (owner === "ai") s.add(id);
    }
    return s;
  }, [state.ownership]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-950">
        <div className="text-5xl">😕</div>
        <div className="text-red-400 text-xl font-bold mt-3">Failed to load map data</div>
      </div>
    );
  }

  const targetName = state.currentTarget ? getCountryName(state.currentTarget) : "";
  const mapReady = !loading && initialized && mapData.paths.length > 0;

  return (
    <div className="flex flex-col h-dvh bg-[#0c1220] overflow-hidden">
      {/* HUD */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2.5 bg-black/60 border-b border-white/[.07] min-h-[52px] sm:min-h-[58px] shrink-0 gap-1">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => navigate({ kind: "regionSelect", mode: "territory" })}
            className="btn-ghost !py-1.5 !px-2.5 sm:!px-3.5 !text-xs !m-0"
          >
            ⬅ <span className="hidden sm:inline">Maps</span>
          </button>
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-slate-500 cursor-pointer text-sm hover:text-slate-300"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        <div className="flex-1 text-center px-1 sm:px-3 min-w-0">
          {!state.finished && state.currentTarget ? (
            <>
              <div className="text-[10px] sm:text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">
                {state.turn === "player" ? "Find this country" : "AI is guessing..."} — ⚔️ Territory Wars
              </div>
              <div className="font-black text-sky-50 text-[clamp(14px,3vw,26px)] leading-tight truncate">
                {targetName}
              </div>
            </>
          ) : state.finished ? (
            <div style={{ animation: "fade-in .4s ease" }}>
              <div className={`text-[clamp(16px,3vw,26px)] font-black ${state.playerArea > state.aiArea ? "text-correct" : "text-wrong"}`}>
                {state.playerArea > state.aiArea ? "🏆 Victory!" : state.playerArea === state.aiArea ? "🤝 Draw!" : "💀 Defeat"}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-1 sm:gap-2 items-center shrink-0">
          {state.currentStreak >= 3 && !state.finished && (
            <div className="text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/15 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
              🔥{state.currentStreak}
            </div>
          )}
          <span className="text-[10px] sm:text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-0.5 sm:py-1 rounded-md">
            ⚔️ Territory
          </span>
        </div>
      </div>

      {/* Territory Bar */}
      <TerritoryBar
        playerArea={state.playerArea}
        aiArea={state.aiArea}
        totalArea={state.totalArea}
        playerCountries={state.playerCountries}
        aiCountries={state.aiCountries}
        totalCountries={state.totalCountries}
        turn={state.turn}
        finished={state.finished}
      />

      {state.flash && (
        <FlashMessage
          type={state.flash.type === "ai-claim" ? "wrong" : state.flash.type}
          score={undefined}
          streak={state.flash.type === "correct" && state.currentStreak >= 3 ? state.currentStreak : undefined}
        />
      )}

      {showConfetti && <Confetti />}

      <div className="flex-1 relative overflow-hidden bg-[#111827]">
        {!mapReady ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="spinner" />
            <span className="text-slate-600 text-sm">Loading map...</span>
          </div>
        ) : (
          <ZoomMap
            paths={mapData.paths}
            correctIds={territoryCorrectIds}
            wrongIds={territoryWrongIds}
            revealId={null}
            answerRevealed={false}
            ended={state.finished}
            practiceMode={false}
            onCountryClick={handleCountryClick}
          />
        )}
      </div>

      {/* End overlay */}
      {state.finished && (
        <div className="flex flex-col gap-3 items-center px-4 py-4 bg-black/50 border-t border-white/[.08] shrink-0">
          <div className="flex gap-4 items-center text-sm flex-wrap justify-center mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-black text-lg">🛡 {state.playerCountries}</span>
              <span className="text-slate-500 text-xs">countries</span>
            </div>
            <div className="text-slate-600">vs</div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-black text-lg">🤖 {state.aiCountries}</span>
              <span className="text-slate-500 text-xs">countries</span>
            </div>
            {state.maxStreak >= 3 && (
              <div className="flex items-center gap-1">
                <span className="text-orange-400 font-bold">🔥 {state.maxStreak}</span>
                <span className="text-slate-500 text-xs">MAX STREAK</span>
              </div>
            )}
          </div>
          <div className="flex gap-2.5 justify-center flex-wrap">
            <button
              className="btn-primary !text-base !px-6 !py-3"
              onClick={() => setInitialized(false)}
            >
              🔄 Rematch
            </button>
            <button className="btn-ghost !px-5 !py-3 !text-[15px]" onClick={handleShare}>
              {copied ? "✅ Copied!" : "📤 Share"}
            </button>
            <button
              className="btn-ghost !px-6 !py-3 !text-[15px]"
              onClick={() => navigate({ kind: "regionSelect", mode: "territory" })}
            >
              🗺 Change Map
            </button>
            <button
              className="btn-ghost !px-6 !py-3 !text-[15px]"
              onClick={() => navigate({ kind: "menu" })}
            >
              🏠 Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
