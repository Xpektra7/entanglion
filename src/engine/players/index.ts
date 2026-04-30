import type { GameState, PlayerId } from "../../types/index.ts";

export function getCurrentPlayer(state: GameState): PlayerId {
  return state.currentPlayerId;
}
