interface FlashMessageProps {
  type: "correct" | "wrong";
  score?: number;
  streak?: number;
}

export default function FlashMessage({ type, score, streak }: FlashMessageProps) {
  const isCorrect = type === "correct";

  let text: string;
  if (isCorrect) {
    text = score ? `+${score}` : "✓ Correct!";
    if (streak && streak >= 3) {
      text += ` 🔥x${streak}`;
    }
  } else {
    text = "✗ Wrong!";
  }

  return (
    <div
      className={`
        fixed top-[70px] left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full font-bold text-[15px] z-[300]
        shadow-[0_4px_24px_rgba(0,0,0,.6)] whitespace-nowrap pointer-events-none text-white
        ${isCorrect ? "bg-correct-dark border border-green-500" : "bg-wrong-dark border border-red-500"}
      `}
      style={{ animation: "pop-in .2s ease" }}
    >
      {text}
    </div>
  );
}
