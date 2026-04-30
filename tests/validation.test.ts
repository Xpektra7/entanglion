import { describe, expect, test } from "bun:test";

import { loadGameCatalogs, validateGameCatalogs } from "../src/data/validation.ts";

describe("catalog validation", () => {
  test("accepts canonical catalogs", async () => {
    const catalogs = await loadGameCatalogs();

    expect(catalogs.boardLocations).toHaveLength(12);
    expect(catalogs.engineCards).toHaveLength(5);
    expect(catalogs.eventCards).toHaveLength(9);
    expect(catalogs.quantumComponents).toHaveLength(8);
  });

  test("rejects malformed catalogs", () => {
    expect(() =>
      validateGameCatalogs({
        boardLocations: [],
        engineCards: [],
        eventCards: [],
        quantumComponents: [],
      }),
    ).toThrow();
  });
});
