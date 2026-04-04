import type { GameMode } from "../types";
import TimerDisplay from "./TimerDisplay";

interface GameHUDProps {
  targetName: string;
  currentIndex: number;
  totalCountries: number;
  lives: number;
  mode: GameMode;
  finished: boolean;
  won: boolean;
  correctCount: number;
  progress: number;
  score: number;
  streak: number;
  timeRemaining: number;
  flagEmoji?: string;
  capitalName?: string;
  onBack: () => void;
}

const MODE_LABELS: Partial<Record<GameMode, string>> = {
  practice: "Practice",
  timed: "Timed",
  speedrun: "Speed Run",
  flags: "Flags",
  capitals: "Capitals",
};

const LIVES_MODES = new Set<GameMode>(["classic", "flags", "capitals"]);

export default function GameHUD({
  targetName,
  currentIndex,
  totalCountries,
  lives,
  mode,
  finished,
  won,
  correctCount,
  progress,
  score,
  streak,
  timeRemaining,
  flagEmoji,
  capitalName,
  onBack,
}: GameHUDProps) {
  const showLives = LIVES_MODES.has(mode);
  const showTimer = mode === "timed" || mode === "speedrun";
  const modeLabel = MODE_LABELS[mode];

  // Build the prompt text
  let promptLabel = "Find this country";
  let promptValue = targetName;
  if (mode === "flags" && flagEmoji) {
    promptLabel = "Which country has this flag?";
    promptValue = flagEmoji;
  } else if (mode === "capitals" && capitalName) {
    promptLabel = "Which country's capital is...";
    promptValue = capitalName;
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/[.07] min-h-[58px] shrink-0">
        <button onClick={onBack} className="btn-ghost !py-1.5 !px-3.5 !text-xs !m-0">
          ⬅ Maps
        </button>

        <div className="flex-1 text-center px-3">
          {!finished ? (
            <>
              <div className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">
                {promptLabel} — {currentIndex}/{totalCountries}
              </div>
              <div
                className={`font-black text-sky-50 leading-tight tracking-wide ${
                  mode === "flags" ? "text-4xl" : "text-[clamp(16px,3vw,26px)]"
                }`}
              >
                {promptValue}
              </div>
            </>
          ) : (
            <div style={{ animation: "fade-in .4s ease" }}>
              <div
                className={`text-[clamp(18px,3vw,26px)] font-black ${won ? "text-correct" : "text-wrong"}`}
              >
                {won ? "🏆 You Won!" : "💀 Game Over"}
              </div>
              <div className="text-[13px] text-slate-400 mt-0.5">
                {correctCount}/{totalCountries} found — {score.toLocaleString()} pts
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {/* Score */}
          {score > 0 && !finished && (
            <div className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-1 rounded-md tabular-nums">
              {score.toLocaleString()}
            </div>
          )}

          {/* Streak */}
          {streak >= 3 && !finished && (
            <div className="text-xs font-bold text-orange-400 bg-orange-500/15 px-2 py-1 rounded-md">
              🔥{streak}
            </div>
          )}

          {/* Timer */}
          {showTimer && !finished && (
            <TimerDisplay
              seconds={mode === "timed" ? timeRemaining : Math.floor((Date.now() - 0) / 1000)}
              mode={mode === "timed" ? "countdown" : "stopwatch"}
            />
          )}

          {/* Lives */}
          {showLives &&
            [0, 1, 2].map((i) => (
              <span
                key={i}
                className="text-[22px] transition-opacity duration-300"
                style={{ opacity: i < lives ? 1 : 0.18 }}
              >
                ❤️
              </span>
            ))}

          {/* Mode badge */}
          {modeLabel && !showLives && !showTimer && (
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-md">
              {modeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-400 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </>
  );
}
