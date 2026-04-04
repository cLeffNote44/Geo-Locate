import type { GameState, GameAction } from "../types";
import { calculateRoundScore } from "../lib/scoring";

export const initialGameState: GameState = {
  mode: "classic",
  region: "world",
  queue: [],
  currentIndex: 0,
  lives: 3,
  results: [],
  flash: null,
  wrongClickId: null,
  answerRevealed: false,
  finished: false,
  startedAt: 0,
  roundStartedAt: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  timeLimit: null,
  timeRemaining: 0,
  timePenalty: 0,
};

function getLives(mode: string, lives?: number): number {
  if (mode === "practice" || mode === "speedrun") return Infinity;
  if (mode === "timed") return Infinity;
  return lives ?? 3;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INIT_GAME": {
      const timeLimit = action.timeLimit ?? null;
      return {
        ...initialGameState,
        mode: action.mode,
        region: action.region,
        queue: action.queue,
        lives: getLives(action.mode, action.lives),
        startedAt: Date.now(),
        roundStartedAt: Date.now(),
        timeLimit,
        timeRemaining: timeLimit ?? 0,
      };
    }

    case "CLICK_COUNTRY": {
      if (state.finished) return state;
      if (state.currentIndex >= state.queue.length) return state;

      const targetId = state.queue[state.currentIndex];
      const timeMs = action.timestamp - state.roundStartedAt;

      if (action.countryId === targetId) {
        // Correct answer
        const newStreak = state.streak + 1;
        const maxStreak = Math.max(state.maxStreak, newStreak);
        const roundScore = calculateRoundScore(timeMs, newStreak);
        const newScore = state.score + roundScore.total;

        const newResults = [
          ...state.results,
          { countryId: targetId, correct: true, timeMs, score: roundScore.total },
        ];
        const newIndex = state.currentIndex + 1;
        const finished = newIndex >= state.queue.length;

        return {
          ...state,
          results: newResults,
          currentIndex: newIndex,
          flash: {
            type: "correct",
            score: roundScore.total,
            streak: newStreak >= 3 ? newStreak : undefined,
          },
          wrongClickId: null,
          answerRevealed: false,
          finished,
          roundStartedAt: Date.now(),
          score: newScore,
          streak: newStreak,
          maxStreak,
        };
      }

      // Wrong answer — different handling per mode
      const wrongResult = { countryId: targetId, correct: false, timeMs, score: 0 };

      if (state.mode === "practice") {
        // Practice: stay on same country, no penalty
        return {
          ...state,
          results: [...state.results, wrongResult],
          flash: { type: "wrong" },
          wrongClickId: targetId,
          streak: 0,
        };
      }

      if (state.mode === "speedrun") {
        // Speed run: flash red but don't advance, no penalty
        return {
          ...state,
          results: [...state.results, wrongResult],
          flash: { type: "wrong" },
          wrongClickId: targetId,
          streak: 0,
        };
      }

      if (state.mode === "timed") {
        // Timed: time penalty, advance to next
        const newIndex = state.currentIndex + 1;
        const finished = newIndex >= state.queue.length;
        return {
          ...state,
          results: [...state.results, wrongResult],
          flash: { type: "wrong" },
          wrongClickId: targetId,
          answerRevealed: false,
          finished,
          currentIndex: finished ? state.currentIndex : newIndex,
          roundStartedAt: Date.now(),
          streak: 0,
          timePenalty: state.timePenalty + 5,
          timeRemaining: state.timeRemaining - 5,
        };
      }

      // Classic / flags / capitals: lose a life, advance
      const newLives = state.lives - 1;
      const finished = newLives <= 0;
      return {
        ...state,
        results: [...state.results, wrongResult],
        lives: newLives,
        flash: { type: "wrong" },
        wrongClickId: targetId,
        answerRevealed: false,
        finished,
        currentIndex: finished ? state.currentIndex : state.currentIndex + 1,
        roundStartedAt: Date.now(),
        streak: 0,
      };
    }

    case "REVEAL_ANSWER":
      return { ...state, answerRevealed: true };

    case "NEXT_COUNTRY": {
      const newIndex = state.currentIndex + 1;
      const finished = newIndex >= state.queue.length;
      return {
        ...state,
        currentIndex: newIndex,
        wrongClickId: null,
        answerRevealed: false,
        finished,
        roundStartedAt: Date.now(),
      };
    }

    case "TICK_TIMER": {
      if (state.finished || !state.timeLimit) return state;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000) + state.timePenalty;
      const remaining = Math.max(0, state.timeLimit - elapsed);
      if (remaining <= 0) {
        return { ...state, timeRemaining: 0, finished: true };
      }
      return { ...state, timeRemaining: remaining };
    }

    case "TIME_EXPIRED":
      return { ...state, timeRemaining: 0, finished: true };

    case "CLEAR_FLASH":
      return { ...state, flash: null };

    case "CLEAR_WRONG_HIGHLIGHT":
      return { ...state, wrongClickId: null };

    case "QUIT":
      return { ...state, finished: true };

    default:
      return state;
  }
}
