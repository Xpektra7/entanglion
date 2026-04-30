import type { GameState } from "../../types/index.ts";

export function hasWon(state: GameState): boolean {
  return state.phase === "won";
}

export function hasLost(state: GameState): boolean {
  return state.phase === "lost";
}
