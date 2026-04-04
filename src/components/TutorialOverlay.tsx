import { useState } from "react";

interface TutorialStep {
  emoji: string;
  title: string;
  description: string;
}

const STEPS: TutorialStep[] = [
  {
    emoji: "🎯",
    title: "Find the Country",
    description: "Look at the country name at the top of the screen, then find it on the map and click it!",
  },
  {
    emoji: "🗺️",
    title: "Navigate the Map",
    description: "Scroll to zoom in and out. Click and drag to pan around. Use the + / - buttons on the right.",
  },
  {
    emoji: "🔥",
    title: "Build Streaks",
    description: "Get consecutive correct answers to build streaks. At 3+, 5+, and 10+ streak you earn score multipliers!",
  },
  {
    emoji: "💡",
    title: "Use Hints",
    description: "Stuck? Click the hint button for help. Hints cost points but can save your lives. Try region → neighbors → reveal.",
  },
  {
    emoji: "📅",
    title: "Daily Challenges",
    description: "Come back every day for a new Daily Challenge! Same 10 countries for everyone. Build your daily streak!",
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-8 shadow-2xl text-center"
        style={{ animation: "fade-in .3s ease" }}
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-blue-500" : i < step ? "bg-blue-500/40" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="text-5xl mb-4">{current.emoji}</div>
        <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          {current.description}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            className="btn-ghost !px-5 !py-2.5 !text-sm"
            onClick={onComplete}
          >
            Skip
          </button>
          <button
            className="btn-primary !px-6 !py-2.5 !text-sm"
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
          >
            {isLast ? "Let's Play! 🚀" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
