interface TimerDisplayProps {
  seconds: number;
  mode: "countdown" | "stopwatch";
  danger?: boolean;
}

export default function TimerDisplay({ seconds, mode, danger }: TimerDisplayProps) {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

  const isDanger = danger ?? (mode === "countdown" && seconds <= 10);

  return (
    <div
      className={`
        font-mono font-black text-lg tabular-nums
        ${isDanger ? "text-red-400 animate-pulse" : mode === "countdown" ? "text-amber-400" : "text-sky-400"}
      `}
    >
      {mode === "countdown" ? "⏱ " : "⏱ "}
      {formatted}
    </div>
  );
}
