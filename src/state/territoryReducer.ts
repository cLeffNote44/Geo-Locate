import type { CountryId, RegionValue, Difficulty } from "../types";

export type Owner = "player" | "ai" | "unclaimed";

export interface TerritoryState {
  region: RegionValue;
  difficulty: Difficulty;
  queue: CountryId[];
  currentIndex: number;
  turn: "player" | "ai";
  ownership: Record<CountryId, Owner>;
  playerArea: number;
  aiArea: number;
  playerCountries: number;
  aiCountries: number;
  totalArea: number;
  totalCountries: number;
  currentTarget: CountryId | null;
  flash: { type: "correct" | "wrong" | "ai-claim"; countryId: CountryId; owner: Owner } | null;
  finished: boolean;
  started: boolean;
  roundStartedAt: number;
  // Track results for achievements/history
  playerCorrect: number;
  playerWrong: number;
  aiCorrect: number;
  aiWrong: number;
  maxStreak: number;
  currentStreak: number;
}

export type TerritoryAction =
  | { type: "INIT"; region: RegionValue; difficulty: Difficulty; queue: CountryId[]; areas: Record<CountryId, number> }
  | { type: "CLICK_COUNTRY"; countryId: CountryId }
  | { type: "AI_TURN_RESULT"; correct: boolean; bonusClaimId?: CountryId }
  | { type: "CLEAR_FLASH" }
  | { type: "QUIT" };

// Area lookup — populated at init
let areaMap: Record<CountryId, number> = {};

function claimCountry(
  state: TerritoryState,
  id: CountryId,
  owner: "player" | "ai",
): TerritoryState {
  if (state.ownership[id] !== "unclaimed") return state;
  const area = areaMap[id] ?? 0;
  return {
    ...state,
    ownership: { ...state.ownership, [id]: owner },
    playerArea: owner === "player" ? state.playerArea + area : state.playerArea,
    aiArea: owner === "ai" ? state.aiArea + area : state.aiArea,
    playerCountries: owner === "player" ? state.playerCountries + 1 : state.playerCountries,
    aiCountries: owner === "ai" ? state.aiCountries + 1 : state.aiCountries,
  };
}

function advanceToNextUnclaimed(state: TerritoryState): TerritoryState {
  let idx = state.currentIndex + 1;
  while (idx < state.queue.length && state.ownership[state.queue[idx]] !== "unclaimed") {
    idx++;
  }
  if (idx >= state.queue.length) {
    return { ...state, currentIndex: idx, currentTarget: null, finished: true };
  }
  return {
    ...state,
    currentIndex: idx,
    currentTarget: state.queue[idx],
    roundStartedAt: Date.now(),
  };
}

export const initialTerritoryState: TerritoryState = {
  region: "world",
  difficulty: "normal",
  queue: [],
  currentIndex: 0,
  turn: "player",
  ownership: {},
  playerArea: 0,
  aiArea: 0,
  playerCountries: 0,
  aiCountries: 0,
  totalArea: 0,
  totalCountries: 0,
  currentTarget: null,
  flash: null,
  finished: false,
  started: false,
  roundStartedAt: 0,
  playerCorrect: 0,
  playerWrong: 0,
  aiCorrect: 0,
  aiWrong: 0,
  maxStreak: 0,
  currentStreak: 0,
};

export function territoryReducer(state: TerritoryState, action: TerritoryAction): TerritoryState {
  switch (action.type) {
    case "INIT": {
      areaMap = action.areas;
      const ownership: Record<CountryId, Owner> = {};
      let totalArea = 0;
      for (const id of action.queue) {
        ownership[id] = "unclaimed";
        totalArea += action.areas[id] ?? 0;
      }
      return {
        ...initialTerritoryState,
        region: action.region,
        difficulty: action.difficulty,
        queue: action.queue,
        totalCountries: action.queue.length,
        totalArea,
        ownership,
        currentTarget: action.queue[0] ?? null,
        started: true,
        roundStartedAt: Date.now(),
        turn: "player",
      };
    }

    case "CLICK_COUNTRY": {
      if (state.finished || state.turn !== "player" || !state.currentTarget) return state;

      const target = state.currentTarget;

      if (action.countryId === target) {
        // Player correct — claim territory
        let next = claimCountry(state, target, "player");
        const newStreak = state.currentStreak + 1;
        next = {
          ...next,
          playerCorrect: state.playerCorrect + 1,
          currentStreak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          flash: { type: "correct", countryId: target, owner: "player" },
          turn: "ai",
        };
        return advanceToNextUnclaimed(next);
      }

      // Player wrong — AI claims the target + a bonus neighbor
      let next = claimCountry(state, target, "ai");
      next = {
        ...next,
        playerWrong: state.playerWrong + 1,
        currentStreak: 0,
        flash: { type: "wrong", countryId: target, owner: "ai" },
        turn: "ai",
      };
      return advanceToNextUnclaimed(next);
    }

    case "AI_TURN_RESULT": {
      if (state.finished || state.turn !== "ai" || !state.currentTarget) return state;

      const target = state.currentTarget;

      if (action.correct) {
        // AI correct — claims territory
        let next = claimCountry(state, target, "ai");
        next = {
          ...next,
          aiCorrect: state.aiCorrect + 1,
          flash: { type: "ai-claim", countryId: target, owner: "ai" },
          turn: "player",
        };
        // Bonus claim if available
        if (action.bonusClaimId && next.ownership[action.bonusClaimId] === "unclaimed") {
          next = claimCountry(next, action.bonusClaimId, "ai");
        }
        return advanceToNextUnclaimed(next);
      }

      // AI wrong — player gets it free
      let next = claimCountry(state, target, "player");
      next = {
        ...next,
        aiWrong: state.aiWrong + 1,
        flash: { type: "correct", countryId: target, owner: "player" },
        turn: "player",
      };
      return advanceToNextUnclaimed(next);
    }

    case "CLEAR_FLASH":
      return { ...state, flash: null };

    case "QUIT":
      return { ...state, finished: true };

    default:
      return state;
  }
}
