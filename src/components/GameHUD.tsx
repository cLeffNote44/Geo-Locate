import type { GameMode } from "../types";

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
  onBack: () => void;
}

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
  onBack,
}: GameHUDProps) {
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
                Find this country — {currentIndex}/{totalCountries}
              </div>
              <div className="text-[clamp(16px,3vw,26px)] font-black text-sky-50 leading-tight tracking-wide">
                {targetName}
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
                {correctCount} / {totalCountries} countries found
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1 items-center">
          {mode === "classic"
            ? [0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="text-[22px] transition-opacity duration-300"
                  style={{ opacity: i < lives ? 1 : 0.18 }}
                >
                  ❤️
                </span>
              ))
            : (
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-md">
                  Practice
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
