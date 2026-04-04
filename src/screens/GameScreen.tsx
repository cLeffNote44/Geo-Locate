import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { GameMode, RegionValue, Screen, CountryId, GameSummary } from "../types";
import type { AchievementId } from "../types";
import { useWorldMap } from "../hooks/useWorldMap";
import { useGame } from "../hooks/useGame";
import { useSpacedRep } from "../hooks/useSpacedRep";
import { useGameHistory } from "../hooks/useGameHistory";
import { useAchievements } from "../hooks/useAchievements";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useSpeedRunPB } from "../hooks/useSpeedRunPB";
import { useSound } from "../hooks/useSound";
import { CONTINENTS } from "../data/continents";
import { getProjection, buildMapFeatures } from "../lib/mapUtils";
import { buildQueue } from "../lib/queue";
import { getCountryName, getCountryInfo } from "../lib/countryLookup";
import { getRegionLabel } from "../data/regions";
import { buildSummary } from "../state/selectors";
import { checkAchievements } from "../lib/achievements";
import ZoomMap from "../components/ZoomMap";
import GameHUD from "../components/GameHUD";
import FlashMessage from "../components/FlashMessage";
import Confetti from "../components/Confetti";
import EndOverlay from "../components/EndOverlay";
import CountryInfoPanel from "../components/CountryInfoPanel";
import AchievementToast from "../components/AchievementToast";

const TIMED_DURATION = 120; // seconds

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
  const { history, addEntry } = useGameHistory();
  const { achievements, unlock } = useAchievements();
  const { addScore } = useLeaderboard();
  const { updatePB } = useSpeedRunPB();
  const { muted, toggleMute, playCorrect, playWrong, playStreak, playWin, playLose } = useSound();
  const [initialized, setInitialized] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [infoPanelId, setInfoPanelId] = useState<CountryId | null>(null);
  const [savedResult, setSavedResult] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementId[]>([]);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const summaryRef = useRef<GameSummary | null>(null);

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
      timeLimit: mode === "timed" ? TIMED_DURATION : undefined,
    });
    setInitialized(true);
    setSavedResult(false);
    setNewAchievements([]);
    summaryRef.current = null;
  }, [mapData.availableIds, initialized, mode, region, dispatch, getAllRecords]);

  // Timer tick (timed mode)
  useEffect(() => {
    if (mode !== "timed" || !initialized || state.finished) return;
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, initialized, state.finished, dispatch]);

  // Stopwatch for speedrun
  useEffect(() => {
    if (mode !== "speedrun" || !initialized || state.finished) return;
    const interval = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - state.startedAt) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [mode, initialized, state.finished, state.startedAt]);

  // Sound effects on flash
  useEffect(() => {
    if (!state.flash) return;
    if (state.flash.type === "correct") {
      if (state.flash.streak && state.flash.streak >= 3) {
        playStreak(state.flash.streak);
      } else {
        playCorrect();
      }
    } else {
      playWrong();
    }
    const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 1800);
    return () => clearTimeout(t);
  }, [state.flash, dispatch, playCorrect, playWrong, playStreak]);

  // Auto-clear wrong highlight
  useEffect(() => {
    if (!state.wrongClickId || mode === "practice" || mode === "speedrun") return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_WRONG_HIGHLIGHT" }), 2000);
    return () => clearTimeout(t);
  }, [state.wrongClickId, mode, dispatch]);

  // Save result when game ends
  useEffect(() => {
    if (!state.finished || savedResult) return;
    setSavedResult(true);
    const summary = buildSummary(state, region);
    summaryRef.current = summary;

    // Update spaced rep records
    batchUpdate(
      state.results.map((r) => ({
        countryId: r.countryId,
        correct: r.correct,
      })),
    );

    const histEntry = {
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
      score: summary.score,
      maxStreak: summary.maxStreak,
    };
    addEntry(histEntry);

    // Leaderboard
    if (summary.score > 0) {
      addScore({
        score: summary.score,
        date: histEntry.date,
        mode,
        region,
        pct: histEntry.pct,
      });
    }

    // Speed run personal best
    if (mode === "speedrun" && summary.won) {
      updatePB(region, Math.round(summary.totalTimeMs / 1000));
    }

    // Sound + confetti
    if (summary.won) {
      playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      playLose();
    }

    // Check achievements
    const srRecords = getAllRecords();
    const newAchs = checkAchievements(
      summary,
      [...history, histEntry],
      srRecords,
      achievements,
    );
    if (newAchs.length > 0) {
      unlock(newAchs);
      setNewAchievements(newAchs);
    }
  }, [state.finished, savedResult, state, region, mode, batchUpdate, addEntry, addScore, updatePB, getAllRecords, history, achievements, unlock, playWin, playLose]);

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

  // Mode-specific prompt data
  const currentId = derived.currentCountryId;
  const targetName = currentId ? getCountryName(currentId) : "";
  const currentInfo = currentId ? getCountryInfo(currentId) : undefined;
  const flagEmoji = mode === "flags" && currentInfo ? currentInfo.flag_emoji : undefined;
  const capitalName = mode === "capitals" && currentInfo ? currentInfo.capital : undefined;

  const mapReady = !loading && initialized && mapData.paths.length > 0;
  const showPracticeControls = mode === "practice" && !state.finished && mapReady;
  const showSpeedrunControls = mode === "speedrun" && !state.finished && mapReady;

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
        score={state.score}
        streak={state.streak}
        timeRemaining={mode === "timed" ? state.timeRemaining : elapsedSecs}
        flagEmoji={flagEmoji}
        capitalName={capitalName}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={() => navigate({ kind: "regionSelect", mode })}
      />

      {state.flash && (
        <FlashMessage
          type={state.flash.type}
          score={state.flash.score}
          streak={state.flash.streak}
        />
      )}

      {/* Confetti on win */}
      {showConfetti && <Confetti />}

      {/* Achievement toast */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievementIds={newAchievements}
          onDone={() => setNewAchievements([])}
        />
      )}

      <div className="flex-1 relative overflow-hidden bg-[#111827]">
        {!mapReady ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="spinner" />
            <span className="text-slate-600 text-sm">Loading map...</span>
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

        {infoPanelId && (
          <CountryInfoPanel
            countryId={infoPanelId}
            onClose={() => setInfoPanelId(null)}
          />
        )}
      </div>

      {/* Practice mode controls */}
      {showPracticeControls && (
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

      {/* Speed run controls (show answer on wrong) */}
      {showSpeedrunControls && state.wrongClickId && (
        <div className="flex gap-2.5 justify-center px-4 py-2 bg-black/40 border-t border-white/[.08] shrink-0">
          <span className="text-xs text-slate-500">
            Wrong click — try again! Looking for: <span className="text-white font-bold">{targetName}</span>
          </span>
        </div>
      )}

      {state.finished && (
        <EndOverlay
          summary={summaryRef.current ?? undefined}
          onPlayAgain={handlePlayAgain}
          onChangeMap={() => navigate({ kind: "regionSelect", mode })}
          onMainMenu={() => navigate({ kind: "menu" })}
        />
      )}
    </div>
  );
}
