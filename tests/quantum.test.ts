import { describe, expect, test } from "bun:test";

import { resolveQuantumComponentDrop, resolveQuantumEventMove } from "../src/engine/quantum/index.ts";
import { createInitialGameState } from "../src/engine/state/index.ts";

describe("quantum helpers", () => {
  test("heisenberg move uses clockwise entanglion order", () => {
    const state = createInitialGameState();

    const next = resolveQuantumEventMove(state, "ship-1", 1);

    expect(next.ships["ship-1"].location).toEqual({ galaxy: "entanglion", location: "omega-one" });
    expect(next.ships["ship-2"].location).toEqual({ galaxy: "entanglion", location: "omega-one" });
  });

  test("spooky action drops component onto first unoccupied entanglion slot", () => {
    const state = createInitialGameState({
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
          location: { galaxy: "entanglion", location: "phi-plus" },
          components: [],
        },
      },
    });

    const next = resolveQuantumComponentDrop(state, "ship-1", "quantum-gates", 1);

    expect(next.componentLocations["omega-one"]).toBe("quantum-gates");
  });
});
