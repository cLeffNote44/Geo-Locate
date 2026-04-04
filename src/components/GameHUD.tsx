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
  muted: boolean;
  onToggleMute: () => void;
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
  muted,
  onToggleMute,
  onBack,
}: GameHUDProps) {
  const showLives = LIVES_MODES.has(mode);
  const showTimer = mode === "timed" || mode === "speedrun";
  const modeLabel = MODE_LABELS[mode];

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
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2.5 bg-black/60 border-b border-white/[.07] min-h-[52px] sm:min-h-[58px] shrink-0 gap-1">
        {/* Left: back + mute */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onBack} className="btn-ghost !py-1.5 !px-2.5 sm:!px-3.5 !text-xs !m-0">
            ⬅
            <span className="hidden sm:inline"> Maps</span>
          </button>
          <button
            onClick={onToggleMute}
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-slate-500 cursor-pointer text-sm hover:text-slate-300"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        {/* Center: prompt */}
        <div className="flex-1 text-center px-1 sm:px-3 min-w-0">
          {!finished ? (
            <>
              <div className="text-[10px] sm:text-[11px] text-slate-600 uppercase tracking-widest mb-0.5 truncate">
                {promptLabel} — {currentIndex}/{totalCountries}
              </div>
              <div
                className={`font-black text-sky-50 leading-tight tracking-wide truncate ${
                  mode === "flags" ? "text-3xl sm:text-4xl" : "text-[clamp(14px,3vw,26px)]"
                }`}
              >
                {promptValue}
              </div>
            </>
          ) : (
            <div style={{ animation: "fade-in .4s ease" }}>
              <div
                className={`text-[clamp(16px,3vw,26px)] font-black ${won ? "text-correct" : "text-wrong"}`}
              >
                {won ? "🏆 You Won!" : "💀 Game Over"}
              </div>
              <div className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5">
                {correctCount}/{totalCountries} found — {score.toLocaleString()} pts
              </div>
            </div>
          )}
        </div>

        {/* Right: score/streak/timer/lives */}
        <div className="flex gap-1 sm:gap-2 items-center shrink-0 flex-wrap justify-end">
          {score > 0 && !finished && (
            <div className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/15 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md tabular-nums">
              {score.toLocaleString()}
            </div>
          )}

          {streak >= 3 && !finished && (
            <div className="text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/15 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
              🔥{streak}
            </div>
          )}

          {showTimer && !finished && (
            <TimerDisplay
              seconds={mode === "timed" ? timeRemaining : Math.floor((Date.now() - 0) / 1000)}
              mode={mode === "timed" ? "countdown" : "stopwatch"}
            />
          )}

          {showLives &&
            [0, 1, 2].map((i) => (
              <span
                key={i}
                className="text-lg sm:text-[22px] transition-opacity duration-300"
                style={{ opacity: i < lives ? 1 : 0.18 }}
              >
                ❤️
              </span>
            ))}

          {modeLabel && !showLives && !showTimer && (
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 sm:py-1 rounded-md">
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
