import { ENTANGLION_CLOCKWISE_LOCATIONS } from "../../data/catalogs.ts";
import type { GameState, ShipId, QuantumComponentId, EntanglionLocationId } from "../../types/index.ts";
import { moveComponentFromShipToPlanet } from "../state/index.ts";

export function getClockwiseEntanglionLocation(roll: number): EntanglionLocationId {
  const index = (Math.max(roll, 1) - 1) % ENTANGLION_CLOCKWISE_LOCATIONS.length;
  return ENTANGLION_CLOCKWISE_LOCATIONS[index];
}

export function resolveQuantumEventMove(state: GameState, shipId: ShipId, roll: number): GameState {
  const location = getClockwiseEntanglionLocation(roll);
  const nextLocation = { galaxy: "entanglion" as const, location };
  const otherShipId = shipId === "ship-1" ? "ship-2" : "ship-1";

  return {
    ...state,
    ships: {
      ...state.ships,
      [shipId]: {
        ...state.ships[shipId],
        location: nextLocation,
      },
      [otherShipId]: {
        ...state.ships[otherShipId],
        location: nextLocation,
      },
    },
  };
}

export function resolveQuantumComponentDrop(
  state: GameState,
  shipId: ShipId,
  componentId: QuantumComponentId,
  roll: number,
): GameState {
  const occupied = new Set(Object.keys(state.componentLocations));
  const unoccupied = ENTANGLION_CLOCKWISE_LOCATIONS.filter((location) => !occupied.has(location));
  if (unoccupied.length === 0) {
    return state;
  }

  const location = unoccupied[(Math.max(roll, 1) - 1) % unoccupied.length];
  return moveComponentFromShipToPlanet(state, shipId, location, componentId);
}
