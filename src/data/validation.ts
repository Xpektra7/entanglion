import { readFile } from "node:fs/promises";

import {
  BOARD_LOCATIONS,
  CENTARIOUS_LOCATIONS,
  ENGINE_CARDS,
  ENTANGLION_LOCATIONS,
  EVENT_CARDS,
  GALAXIES,
  QUANTUM_COMPONENTS,
  SUPERIOUS_LOCATIONS,
} from "./catalogs.ts";
import type {
  BoardLocation,
  CentariousLocationId,
  EngineCardId,
  EntanglionLocationId,
  EventCardId,
  GalaxyId,
  QuantumComponentId,
  SuperiousLocationId,
} from "../types/index.ts";

export type GameCatalogs = {
  boardLocations: BoardLocation[];
  engineCards: EngineCardId[];
  eventCards: EventCardId[];
  quantumComponents: QuantumComponentId[];
};

const CATALOGS_FILE = new URL("./catalogs.json", import.meta.url);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBoardLocation(item: unknown, index: number): BoardLocation {
  if (!isRecord(item)) {
    throw new Error(`boardLocations[${index}] must be an object`);
  }

  const galaxy = item.galaxy;
  const location = item.location;

  if (typeof galaxy !== "string" || !GALAXIES.includes(galaxy as GalaxyId)) {
    throw new Error(`boardLocations[${index}].galaxy invalid`);
  }

  if (typeof location !== "string") {
    throw new Error(`boardLocations[${index}].location invalid`);
  }

  const allowedByGalaxy: Record<GalaxyId, readonly string[]> = {
    centarious: CENTARIOUS_LOCATIONS,
    superious: SUPERIOUS_LOCATIONS,
    entanglion: ENTANGLION_LOCATIONS,
  };

  if (!allowedByGalaxy[galaxy as GalaxyId].includes(location)) {
    throw new Error(`boardLocations[${index}].location invalid for ${galaxy}`);
  }

  return {
    galaxy: galaxy as GalaxyId,
    location: location as CentariousLocationId | SuperiousLocationId | EntanglionLocationId,
  };
}

function validateBoardLocations(value: unknown): BoardLocation[] {
  if (!Array.isArray(value)) {
    throw new Error("boardLocations must be an array");
  }

  if (value.length !== BOARD_LOCATIONS.length) {
    throw new Error("boardLocations length mismatch");
  }

  return value.map((item, index) => {
    const boardLocation = validateBoardLocation(item, index);
    const expected = BOARD_LOCATIONS[index];

    if (boardLocation.galaxy !== expected.galaxy || boardLocation.location !== expected.location) {
      throw new Error(`boardLocations[${index}] out of order`);
    }

    return boardLocation;
  });
}

function validateStringArray<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
  label: string,
): TValue[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }

  if (value.length !== allowedValues.length) {
    throw new Error(`${label} length mismatch`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string") {
      throw new Error(`${label}[${index}] must be a string`);
    }

    if (!allowedValues.includes(item as TValue)) {
      throw new Error(`${label}[${index}] invalid value: ${item}`);
    }

    if (item !== allowedValues[index]) {
      throw new Error(`${label}[${index}] out of order`);
    }

    return item as TValue;
  });
}

export function validateGameCatalogs(value: unknown): GameCatalogs {
  if (!isRecord(value)) {
    throw new Error("catalogs must be an object");
  }

  return {
    boardLocations: validateBoardLocations(value.boardLocations),
    engineCards: validateStringArray(value.engineCards, ENGINE_CARDS, "engineCards"),
    eventCards: validateStringArray(value.eventCards, EVENT_CARDS, "eventCards"),
    quantumComponents: validateStringArray(
      value.quantumComponents,
      QUANTUM_COMPONENTS,
      "quantumComponents",
    ),
  };
}

export async function loadGameCatalogs(): Promise<GameCatalogs> {
  const contents = await readFile(CATALOGS_FILE, "utf8");
  const parsed = JSON.parse(contents) as unknown;
  return validateGameCatalogs(parsed);
}
