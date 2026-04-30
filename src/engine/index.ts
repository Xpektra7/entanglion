import {
  advanceCurrentPlayer,
  discardCard,
  drawCard,
  removeComponentFromPlanet,
  removeCardFromHand,
  setGamePhase,
  setPendingFreeAction,
  updateDetectionRate,
  hasCollectedAllComponents,
} from "./state/index.ts";
import { resolveBennettCard, resolveEventCard, resolveSpookyActionCard, resolveTheMechanicCard } from "./cards/index.ts";
import { getOtherShipId, isOrbitalDefenseSafe, resolveCnotMove, resolveEngineMove, resolveSwapMove } from "./board/index.ts";
import { MAX_DETECTION_RATE } from "../data/index.ts";
import type { GameAction, GameState } from "../types/index.ts";
import { resolveQuantumEventMove } from "./quantum/index.ts";

function isEntanglionLocationId(location: GameState["ships"]["ship-1"]["location"]["location"]): location is keyof GameState["componentLocations"] {
  return (
    location === "omega-zero" ||
    location === "omega-one" ||
    location === "omega-two" ||
    location === "omega-three" ||
    location === "phi-plus" ||
    location === "phi-minus" ||
    location === "psi-plus" ||
    location === "psi-minus"
  );
}

export function reduceGame(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "navigate": {
      const player = state.players[action.playerId];
      if (!player.hand.includes(action.cardId)) {
        return state;
      }

      let nextState = removeCardFromHand(state, action.playerId, action.cardId);
      const shipId = player.shipId;
      const otherShipId = getOtherShipId(state, shipId);
      const ship = nextState.ships[shipId];
      const otherShip = nextState.ships[otherShipId];
      const target = action.target;
      const usedFreeAction = state.pendingFreeAction === "quantum-tunnel";

      if (action.cardId === "cnot") {
        const resolved = resolveCnotMove(ship.location, otherShip.location);
        if (resolved) {
          nextState = {
            ...nextState,
            ships: {
              ...nextState.ships,
              [shipId]: {
                ...nextState.ships[shipId],
                location: resolved.lead,
              },
              [otherShipId]: {
                ...nextState.ships[otherShipId],
                location: resolved.other,
              },
            },
          };
        }
      }

      if (action.cardId === "x" || action.cardId === "h") {
        const resolved = resolveEngineMove(action.cardId, ship.location, target);
        if (resolved) {
          nextState = {
            ...nextState,
            ships: {
              ...nextState.ships,
              [shipId]: {
                ...nextState.ships[shipId],
                location: resolved,
              },
            },
          };
        }
      }

      let drawn = drawCard(discardCard(nextState.engineDeck, action.cardId));

      if (drawn.card === "probe") {
        const probeRoll = action.probeRoll ?? 0;
        const effectiveProbeRoll = action.probeReroll ?? probeRoll;
        if (effectiveProbeRoll < 4) {
          nextState = updateDetectionRate(nextState, (Math.min(nextState.detectionRate + 1, MAX_DETECTION_RATE) as GameState["detectionRate"]));
        }

        const probeDiscarded = discardCard(drawn.deck, "probe");
        drawn = drawCard(probeDiscarded);
      }

      if (action.cardId === "swap") {
        const resolved = resolveSwapMove(ship.location, otherShip.location);
        if (resolved) {
          nextState = {
            ...nextState,
            ships: {
              ...nextState.ships,
              [shipId]: {
                ...nextState.ships[shipId],
                location: resolved.shipA,
              },
              [otherShipId]: {
                ...nextState.ships[otherShipId],
                location: resolved.shipB,
              },
            },
          };
        }
      }

      const movedShip = nextState.ships[shipId];
      if (movedShip.location.galaxy === "entanglion" && !usedFreeAction) {
        const roll = action.entanglionRoll ?? 0;
        const safe = isOrbitalDefenseSafe(roll, nextState.detectionRate);
        if (!safe) {
          const retreatLocation = {
            galaxy: "centarious" as const,
            location: action.centariousRoll === 2 ? ("one" as const) : ("zero" as const),
          };

          nextState = {
            ...nextState,
            ships: {
              ...nextState.ships,
              ["ship-1"]: {
                ...nextState.ships["ship-1"],
                location: retreatLocation,
              },
              ["ship-2"]: {
                ...nextState.ships["ship-2"],
                location: retreatLocation,
              },
            },
            detectionRate: (Math.min(nextState.detectionRate + 1, MAX_DETECTION_RATE) as GameState["detectionRate"]),
          };

          if (nextState.detectionRate === MAX_DETECTION_RATE) {
            nextState = setGamePhase(nextState, "lost");
          }
        }
      }

      if (usedFreeAction) {
        nextState = setPendingFreeAction(nextState, null);
      }

      if (hasCollectedAllComponents(nextState)) {
        nextState = setGamePhase(nextState, "won");
      }

      return advanceCurrentPlayer({
        ...nextState,
        phase: nextState.phase === "won" || nextState.phase === "lost" ? nextState.phase : "playing",
        engineDeck: drawn.deck,
        players: {
          ...nextState.players,
          [action.playerId]: {
            ...nextState.players[action.playerId],
            hand: drawn.card ? [...nextState.players[action.playerId].hand, drawn.card] : [...nextState.players[action.playerId].hand],
          },
        },
      });
    }
    case "exchange": {
      const player = state.players[action.playerId];
      if (!player.hand.includes(action.cardId)) {
        return state;
      }

      const removed = removeCardFromHand(state, action.playerId, action.cardId);
      const discarded = discardCard(removed.engineDeck, action.cardId);
      const drawn = drawCard(discarded);

      return advanceCurrentPlayer({
        ...removed,
        phase: "playing",
        engineDeck: drawn.deck,
        players: {
          ...removed.players,
          [action.playerId]: {
            ...removed.players[action.playerId],
            hand: drawn.card ? [...removed.players[action.playerId].hand, drawn.card] : [...removed.players[action.playerId].hand],
          },
        },
      });
    }
    case "retrieve":
      {
        const shipId = state.players[action.playerId].shipId;
        const ship = state.ships[shipId];
        if (ship.location.galaxy !== "entanglion" || !isEntanglionLocationId(ship.location.location)) {
          return state;
        }

        const componentId = state.componentLocations[ship.location.location];
        if (!componentId) {
          return state;
        }

        if (state.pendingFreeAction === "quantum-tunnel") {
          return advanceCurrentPlayer(
            setPendingFreeAction(
              {
                ...removeComponentFromPlanet(state, ship.location.location),
                phase: "playing",
                ships: {
                  ...state.ships,
                  [shipId]: {
                    ...state.ships[shipId],
                    components: [...state.ships[shipId].components, componentId],
                  },
                },
              },
              null,
            ),
          );
        }

        const roll = action.retrieveRoll ?? 0;
        const effectiveRoll = action.retrieveReroll ?? roll;
        if (effectiveRoll <= state.detectionRate) {
          return advanceCurrentPlayer(
            updateDetectionRate(state, (Math.min(state.detectionRate + 1, MAX_DETECTION_RATE) as GameState["detectionRate"])),
          );
        }

        return advanceCurrentPlayer({
          ...removeComponentFromPlanet(state, ship.location.location),
          phase: "playing",
          ships: {
            ...state.ships,
            [shipId]: {
              ...state.ships[shipId],
              components: [...state.ships[shipId].components, componentId],
            },
          },
        });
      }
    case "play-event": {
      const player = state.players[action.playerId];
      if (!player.hand.includes(action.cardId)) {
        return state;
      }

      const removed = removeCardFromHand(state, action.playerId, action.cardId);
      const resolved = resolveEventCard(removed, action.cardId);
      if (action.cardId === "bennett") {
        return advanceCurrentPlayer({
          ...resolveBennettCard(resolved, action.playerId, action.bennettDirection),
          phase: "playing",
          eventDeck: discardCard(resolved.eventDeck, action.cardId),
        });
      }

      if (action.cardId === "heisenberg") {
        return advanceCurrentPlayer({
          ...resolveQuantumEventMove(resolved, state.players[action.playerId].shipId, action.heisenbergRoll ?? 0),
          phase: "playing",
          eventDeck: discardCard(resolved.eventDeck, action.cardId),
        });
      }

      if (action.cardId === "the-mechanic") {
        return advanceCurrentPlayer({
          ...resolveTheMechanicCard(resolved, action.playerId, action.probeRoll ?? 0, action.probeReroll),
          phase: "playing",
          eventDeck: discardCard(resolved.eventDeck, action.cardId),
        });
      }

      if (action.cardId === "quantum-tunnel") {
        return {
          ...resolved,
          phase: "playing",
          eventDeck: discardCard(resolved.eventDeck, action.cardId),
          pendingFreeAction: "quantum-tunnel",
        };
      }

      if (action.cardId === "spooky-action") {
        const nextState = resolveSpookyActionCard(resolved, action.playerId, action.spookyComponentIndex ?? 0, action.spookyRoll ?? 0);
        if (nextState !== resolved) {
          return advanceCurrentPlayer({
            ...nextState,
            phase: "playing",
            eventDeck: discardCard(resolved.eventDeck, action.cardId),
          });
        }
      }

      return advanceCurrentPlayer({
        ...resolved,
        phase: "playing",
        eventDeck: discardCard(resolved.eventDeck, action.cardId),
      });
    }
    default:
      return state;
  }
}
