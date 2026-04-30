import { describe, expect, test } from "bun:test";

import { reduceGame } from "../src/engine/index.ts";
import { createInitialGameState } from "../src/engine/state/index.ts";

describe("reduceGame", () => {
  test("navigating consumes and redraws engine card", () => {
    const state = createInitialGameState({
      engineDeck: {
        drawPile: ["h"],
        discardPile: [],
      },
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["x"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "x",
      target: { galaxy: "superious", location: "plus" },
    });

    expect(next.players["player-1"].hand).toEqual(["h"]);
    expect(next.engineDeck.discardPile).toEqual(["x"]);
    expect(next.currentPlayerId).toBe("player-2");
  });

  test("playing event removes event card and advances turn", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["heisenberg"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "heisenberg",
    });

    expect(next.players["player-1"].hand).toEqual([]);
    expect(next.eventDeck.discardPile).toEqual(["heisenberg"]);
    expect(next.currentPlayerId).toBe("player-2");
  });

  test("cnot can enter entanglion from zero-plus", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["cnot"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["x"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "cnot",
      target: { galaxy: "entanglion", location: "phi-plus" },
      entanglionRoll: 2,
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "entanglion", location: "phi-plus" });
    expect(next.ships["ship-2"].location).toEqual({ galaxy: "entanglion", location: "phi-plus" });
    expect(next.players["player-1"].hand).toEqual(["x"]);
  });

  test("swap exchanges ships outside entanglion", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["swap"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "minus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["h"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "swap",
      target: { galaxy: "superious", location: "minus" },
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "superious", location: "minus" });
    expect(next.ships["ship-2"].location).toEqual({ galaxy: "centarious", location: "zero" });
  });

  test("x flips zero and one", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["x"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["h"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "x",
      target: { galaxy: "centarious", location: "one" },
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "centarious", location: "one" });
  });

  test("h can move between centarious and superious", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["h"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["x"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "h",
      target: { galaxy: "superious", location: "plus" },
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "superious", location: "plus" });
  });

  test("invalid h target leaves ship in place", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["h"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["x"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "h",
      target: { galaxy: "entanglion", location: "phi-plus" },
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "centarious", location: "zero" });
  });

  test("entanglion move can pass orbital defense", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["cnot"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["x"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "cnot",
      target: { galaxy: "entanglion", location: "phi-plus" },
      entanglionRoll: 2,
    });

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "entanglion", location: "phi-plus" });
    expect(next.phase).toBe("playing");
  });

  test("entanglion detection forces retreat and increases detection", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["cnot"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      engineDeck: {
        drawPile: ["x"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "cnot",
      target: { galaxy: "entanglion", location: "phi-plus" },
      entanglionRoll: 1,
      centariousRoll: 2,
    });

    expect(next.detectionRate).toBe(2);
    expect(next.ships["ship-1"].location).toEqual({ galaxy: "centarious", location: "one" });
    expect(next.ships["ship-2"].location).toEqual({ galaxy: "centarious", location: "one" });
  });

  test("retrieve succeeds on a planet with a component", () => {
    const state = createInitialGameState({
      componentLocations: {
        "phi-plus": "quantum-gates",
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "entanglion", location: "phi-plus" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "retrieve",
      playerId: "player-1",
      retrieveRoll: 2,
    });

    expect(next.ships["ship-1"].components).toEqual(["quantum-gates"]);
    expect(next.componentLocations["phi-plus"]).toBeUndefined();
    expect(next.currentPlayerId).toBe("player-2");
  });

  test("retrieve fail increases detection", () => {
    const state = createInitialGameState({
      componentLocations: {
        "phi-plus": "quantum-gates",
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "entanglion", location: "phi-plus" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "retrieve",
      playerId: "player-1",
      retrieveRoll: 1,
    });

    expect(next.detectionRate).toBe(2);
    expect(next.currentPlayerId).toBe("player-2");
    expect(next.ships["ship-1"].components).toEqual([]);
  });

  test("bit flip error resets detection rate to 4", () => {
    const state = createInitialGameState({
      detectionRate: 2,
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["bit-flip-error"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "bit-flip-error",
    });

    expect(next.detectionRate).toBe(4);
  });

  test("wave function collapse lowers detection rate", () => {
    const state = createInitialGameState({
      detectionRate: 4,
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["wave-function-collapse"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "wave-function-collapse",
    });

    expect(next.detectionRate).toBe(2);
  });

  test("quantum shuffle recycles event discard pile", () => {
    const state = createInitialGameState({
      eventDeck: {
        drawPile: ["bennett"],
        discardPile: ["quantum-tunnel", "heisenberg"],
      },
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["quantum-shuffle"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "quantum-shuffle",
    });

    expect(next.eventDeck.drawPile).toEqual(["bennett", "quantum-tunnel", "heisenberg"]);
    expect(next.eventDeck.discardPile).toEqual(["quantum-shuffle"]);
  });

  test("quantum tunnel enables free retrieve", () => {
    const state = createInitialGameState({
      pendingFreeAction: "quantum-tunnel",
      componentLocations: {
        "phi-plus": "quantum-gates",
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "entanglion", location: "phi-plus" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: [],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "retrieve",
      playerId: "player-1",
    });

    expect(next.ships["ship-1"].components).toEqual(["quantum-gates"]);
    expect(next.pendingFreeAction).toBeNull();
  });

  test("probe card resolves when drawn", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["x"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      engineDeck: {
        drawPile: ["probe"],
        discardPile: [],
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: [],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "navigate",
      playerId: "player-1",
      cardId: "x",
      target: { galaxy: "centarious", location: "one" },
      probeRoll: 1,
    });

    expect(next.engineDeck.discardPile).toContain("probe");
    expect(next.detectionRate).toBe(2);
  });

  test("heisenberg moves both ships", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["heisenberg"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "heisenberg",
      heisenbergRoll: 1,
    });

    expect(next.ships["ship-1"].location.galaxy).toBe("entanglion");
    expect(next.ships["ship-2"].location.galaxy).toBe("entanglion");
  });

  test("bennett transfers first component to other ship", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["bennett"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "centarious", location: "zero" },
          components: ["quantum-gates"],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "bennett",
      bennettDirection: "give",
    });

    expect(next.ships["ship-1"].components).toEqual([]);
    expect(next.ships["ship-2"].components).toEqual(["quantum-gates"]);
  });

  test("the mechanic draws and keeps cards", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["the-mechanic"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      engineDeck: {
        drawPile: ["x", "h", "swap"],
        discardPile: [],
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "the-mechanic",
    });

    expect(next.players["player-1"].hand).toContain("x");
    expect(next.players["player-1"].hand).toContain("h");
    expect(next.eventDeck.discardPile).toContain("the-mechanic");
  });

  test("spooky action drops current ship component", () => {
    const state = createInitialGameState({
      players: {
        "player-1": {
          playerId: "player-1",
          shipId: "ship-1",
          hand: ["spooky-action"],
        },
        "player-2": {
          playerId: "player-2",
          shipId: "ship-2",
          hand: [],
        },
      },
      ships: {
        "ship-1": {
          shipId: "ship-1",
          ownerId: "player-1",
          location: { galaxy: "entanglion", location: "phi-plus" },
          components: ["quantum-gates"],
        },
        "ship-2": {
          shipId: "ship-2",
          ownerId: "player-2",
          location: { galaxy: "superious", location: "plus" },
          components: [],
        },
      },
    });

    const next = reduceGame(state, {
      type: "play-event",
      playerId: "player-1",
      cardId: "spooky-action",
      spookyComponentIndex: 0,
      spookyRoll: 1,
    });

    expect(next.ships["ship-1"].components).toEqual([]);
    expect(next.componentLocations["omega-one"]).toBe("quantum-gates");
  });
});
