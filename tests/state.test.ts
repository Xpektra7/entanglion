import { describe, expect, test } from "bun:test";

import { ENGINE_CARDS } from "../src/data/index.ts";
import {
  addCardToHand,
  addComponentToShip,
  advanceCurrentPlayer,
  createInitialGameState,
  discardCard,
  drawCard,
  moveShip,
  removeCardFromHand,
  swapShips,
  updateDetectionRate,
} from "../src/engine/state/index.ts";

describe("state helpers", () => {
  test("creates initial game state", () => {
    const state = createInitialGameState();

    expect(state.phase).toBe("setup");
    expect(state.currentPlayerId).toBe("player-1");
    expect(state.detectionRate).toBe(1);
    expect(state.remainingComponents).toHaveLength(8);
    expect(state.ships["ship-1"].location).toEqual({ galaxy: "centarious", location: "zero" });
  });

  test("draws and discards cards", () => {
    const deck = {
      drawPile: [ENGINE_CARDS[0], ENGINE_CARDS[1]],
      discardPile: [] as typeof ENGINE_CARDS,
    };

    const drawn = drawCard(deck);

    expect(drawn.card).toBe(ENGINE_CARDS[0]);
    expect(drawn.deck.drawPile).toEqual([ENGINE_CARDS[1]]);

    const discarded = discardCard(drawn.deck, ENGINE_CARDS[0]);
    expect(discarded.discardPile).toEqual([ENGINE_CARDS[0]]);
  });

  test("moves and swaps ships", () => {
    const moved = moveShip(createInitialGameState(), "ship-1", {
      galaxy: "superious",
      location: "plus",
    });

    expect(moved.ships["ship-1"].location).toEqual({ galaxy: "superious", location: "plus" });

    const swapped = swapShips(moved, "ship-1", "ship-2");
    expect(swapped.ships["ship-1"].location).toEqual({ galaxy: "centarious", location: "zero" });
    expect(swapped.ships["ship-2"].location).toEqual({ galaxy: "superious", location: "plus" });
  });

  test("updates hands, detection, and components", () => {
    const handState = addCardToHand(createInitialGameState(), "player-1", "x");
    expect(handState.players["player-1"].hand).toEqual(["x"]);

    const removedState = removeCardFromHand(handState, "player-1", "x");
    expect(removedState.players["player-1"].hand).toEqual([]);

    const detectionState = updateDetectionRate(removedState, 3);
    expect(detectionState.detectionRate).toBe(3);

    const componentState = addComponentToShip(detectionState, "ship-1", "physical-qubits");
    expect(componentState.ships["ship-1"].components).toEqual(["physical-qubits"]);
    expect(componentState.remainingComponents).not.toContain("physical-qubits");
  });

  test("advances current player", () => {
    const state = createInitialGameState();
    expect(advanceCurrentPlayer(state).currentPlayerId).toBe("player-2");
  });
});
