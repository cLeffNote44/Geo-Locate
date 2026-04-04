interface FlashMessageProps {
  type: "correct" | "wrong";
  message?: string;
}

export default function FlashMessage({ type, message }: FlashMessageProps) {
  const isCorrect = type === "correct";
  return (
    <div
      className={`
        fixed top-[70px] left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full font-bold text-[15px] z-[300]
        shadow-[0_4px_24px_rgba(0,0,0,.6)] whitespace-nowrap pointer-events-none text-white
        ${isCorrect ? "bg-correct-dark border border-green-500" : "bg-wrong-dark border border-red-500"}
      `}
      style={{ animation: "pop-in .2s ease" }}
    >
      {message ?? (isCorrect ? "✓ Correct!" : "✗ Wrong answer!")}
    </div>
  );
}
