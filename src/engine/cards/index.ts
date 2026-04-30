import { MAX_DETECTION_RATE } from "../../data/index.ts";
import type { EventCardId, GameState, HandCardId, PlayerId } from "../../types/index.ts";
import {
  discardCard,
  drawCard,
  recycleDeck,
  setPendingFreeAction,
  transferComponentBetweenShips,
  updateDetectionRate,
} from "../state/index.ts";
import { getOtherShipId } from "../board/index.ts";
import { resolveQuantumComponentDrop } from "../quantum/index.ts";

export function resolveEventCard(state: GameState, cardId: EventCardId): GameState {
  switch (cardId) {
    case "bit-flip-error":
      return updateDetectionRate(state, 4);
    case "wave-function-collapse":
      return updateDetectionRate(state, (Math.max(state.detectionRate - 2, 1) as GameState["detectionRate"]));
    case "quantum-shuffle":
      return {
        ...state,
        eventDeck: recycleDeck(state.eventDeck),
      };
    case "schrodinger":
      return updateDetectionRate(state, (Math.min(state.detectionRate + 1, MAX_DETECTION_RATE) as GameState["detectionRate"]));
    case "quantum-tunnel":
      return setPendingFreeAction(state, "quantum-tunnel");
    default:
      return state;
  }
}

export function resolveBennettCard(
  state: GameState,
  playerId: PlayerId,
  direction: "give" | "receive" = "give",
): GameState {
  const shipId = state.players[playerId].shipId;
  const otherShipId = getOtherShipId(state, shipId);
  const fromShipId = direction === "give" ? shipId : otherShipId;
  const toShipId = direction === "give" ? otherShipId : shipId;
  const componentId = state.ships[fromShipId].components[0];

  if (!componentId) {
    return state;
  }

  return transferComponentBetweenShips(state, fromShipId, toShipId, componentId);
}

export function resolveSpookyActionCard(
  state: GameState,
  playerId: PlayerId,
  componentIndex = 0,
  roll = 1,
): GameState {
  const shipId = state.players[playerId].shipId;
  const componentId = state.ships[shipId].components[componentIndex];

  if (!componentId) {
    return state;
  }

  return resolveQuantumComponentDrop(state, shipId, componentId, roll);
}

export function resolveTheMechanicCard(
  state: GameState,
  playerId: PlayerId,
  probeRoll = 0,
  probeReroll?: number,
): GameState {
  const player = state.players[playerId];
  let nextState = state;
  let deck = state.engineDeck;
  const drawnCards: HandCardId[] = [];
  let cardsDrawn = 0;

  while (cardsDrawn < 3) {
    const drawn = drawCard(deck);
    deck = drawn.deck;

    if (!drawn.card) {
      break;
    }

    if (drawn.card === "probe") {
      const effectiveProbeRoll = probeReroll ?? probeRoll;
      if (effectiveProbeRoll < 4) {
        nextState = updateDetectionRate(nextState, (Math.min(nextState.detectionRate + 1, MAX_DETECTION_RATE) as GameState["detectionRate"]));
      }

      deck = discardCard(deck, drawn.card);
      continue;
    }

    if (cardsDrawn < 2) {
      drawnCards.push(drawn.card as HandCardId);
    } else {
      deck = discardCard(deck, drawn.card);
    }

    cardsDrawn += 1;
  }

  return {
    ...nextState,
    engineDeck: deck,
    players: {
      ...nextState.players,
      [playerId]: {
        ...player,
        hand: [...player.hand, ...drawnCards],
      },
    },
  };
}
