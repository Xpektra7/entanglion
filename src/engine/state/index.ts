import {
  INITIAL_DETECTION_RATE,
  QUANTUM_COMPONENTS,
} from "../../data/index.ts";
import type {
  BoardLocation,
  CardId,
  DeckState,
  DetectionRate,
  EngineCardId,
  EntanglionLocationId,
  EventCardId,
  GameState,
  HandCardId,
  PlayerId,
  PlayerState,
  QuantumComponentId,
  ShipId,
  ShipState,
} from "../../types/index.ts";

export type CreateGameStateInput = {
  currentPlayerId?: PlayerId;
  detectionRate?: DetectionRate;
  pendingFreeAction?: GameState["pendingFreeAction"];
  players?: Record<PlayerId, PlayerState>;
  ships?: Record<ShipId, ShipState>;
  engineDeck?: DeckState<EngineCardId>;
  eventDeck?: DeckState<EventCardId>;
  componentLocations?: GameState["componentLocations"];
  remainingComponents?: QuantumComponentId[];
};

const defaultBoardLocation: BoardLocation = {
  galaxy: "centarious",
  location: "zero",
};

function createDeckState<TCard extends EngineCardId | EventCardId>(cards: TCard[] = []): DeckState<TCard> {
  return {
    drawPile: [...cards],
    discardPile: [],
  };
}

function createPlayerState(playerId: PlayerId, shipId: ShipId): PlayerState {
  return {
    playerId,
    hand: [],
    shipId,
  };
}

function createShipState(shipId: ShipId, ownerId: PlayerId): ShipState {
  return {
    shipId,
    ownerId,
    location: { ...defaultBoardLocation },
    components: [],
  };
}

export function createInitialGameState(input: CreateGameStateInput = {}): GameState {
  const player1 = createPlayerState("player-1", "ship-1");
  const player2 = createPlayerState("player-2", "ship-2");

  return {
    phase: "setup",
    currentPlayerId: input.currentPlayerId ?? "player-1",
    detectionRate: input.detectionRate ?? INITIAL_DETECTION_RATE,
    pendingFreeAction: input.pendingFreeAction ?? null,
    players: input.players ?? {
      "player-1": player1,
      "player-2": player2,
    },
    ships: input.ships ?? {
      "ship-1": createShipState("ship-1", "player-1"),
      "ship-2": createShipState("ship-2", "player-2"),
    },
    engineDeck: input.engineDeck ?? createDeckState(),
    eventDeck: input.eventDeck ?? createDeckState(),
    componentLocations: input.componentLocations ?? {},
    remainingComponents: input.remainingComponents ?? [...QUANTUM_COMPONENTS],
  };
}

export function drawCard<TCard extends CardId>(deck: DeckState<TCard>): {
  card: TCard | undefined;
  deck: DeckState<TCard>;
} {
  const [card, ...drawPile] = deck.drawPile;

  return {
    card,
    deck: {
      drawPile,
      discardPile: [...deck.discardPile],
    },
  };
}

export function discardCard<TCard extends CardId>(
  deck: DeckState<TCard>,
  card: TCard,
): DeckState<TCard> {
  return {
    drawPile: [...deck.drawPile],
    discardPile: [...deck.discardPile, card],
  };
}

export function moveShip(
  state: GameState,
  shipId: ShipId,
  location: BoardLocation,
): GameState {
  return {
    ...state,
    ships: {
      ...state.ships,
      [shipId]: {
        ...state.ships[shipId],
        location: { ...location },
      },
    },
  };
}

export function swapShips(state: GameState, shipAId: ShipId, shipBId: ShipId): GameState {
  const shipA = state.ships[shipAId];
  const shipB = state.ships[shipBId];

  return {
    ...state,
    ships: {
      ...state.ships,
      [shipAId]: {
        ...shipA,
        location: { ...shipB.location },
      },
      [shipBId]: {
        ...shipB,
        location: { ...shipA.location },
      },
    },
  };
}

export function addCardToHand(state: GameState, playerId: PlayerId, card: HandCardId): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        hand: [...state.players[playerId].hand, card],
      },
    },
  };
}

export function removeCardFromHand(state: GameState, playerId: PlayerId, card: HandCardId): GameState {
  const hand = state.players[playerId].hand;
  const cardIndex = hand.indexOf(card);

  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        hand:
          cardIndex === -1
            ? [...hand]
            : [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)],
      },
    },
  };
}

export function advanceCurrentPlayer(state: GameState): GameState {
  return {
    ...state,
    currentPlayerId: state.currentPlayerId === "player-1" ? "player-2" : "player-1",
  };
}

export function updateDetectionRate(state: GameState, detectionRate: DetectionRate): GameState {
  return {
    ...state,
    detectionRate,
  };
}

export function setGamePhase(state: GameState, phase: GameState["phase"]): GameState {
  return {
    ...state,
    phase,
  };
}

export function setPendingFreeAction(
  state: GameState,
  pendingFreeAction: GameState["pendingFreeAction"],
): GameState {
  return {
    ...state,
    pendingFreeAction,
  };
}

export function addComponentToShip(
  state: GameState,
  shipId: ShipId,
  componentId: QuantumComponentId,
): GameState {
  return {
    ...state,
    ships: {
      ...state.ships,
      [shipId]: {
        ...state.ships[shipId],
        components: [...state.ships[shipId].components, componentId],
      },
    },
    remainingComponents: state.remainingComponents.filter((id) => id !== componentId),
  };
}

export function transferComponentBetweenShips(
  state: GameState,
  fromShipId: ShipId,
  toShipId: ShipId,
  componentId: QuantumComponentId,
): GameState {
  return addComponentToShip(removeComponentFromShip(state, fromShipId, componentId), toShipId, componentId);
}

export function removeComponentFromShip(
  state: GameState,
  shipId: ShipId,
  componentId: QuantumComponentId,
): GameState {
  return {
    ...state,
    ships: {
      ...state.ships,
      [shipId]: {
        ...state.ships[shipId],
        components: state.ships[shipId].components.filter((id) => id !== componentId),
      },
    },
  };
}

export function moveComponentFromShipToPlanet(
  state: GameState,
  shipId: ShipId,
  location: EntanglionLocationId,
  componentId: QuantumComponentId,
): GameState {
  return placeComponentOnPlanet(removeComponentFromShip(state, shipId, componentId), location, componentId);
}

export function placeComponentOnPlanet(
  state: GameState,
  location: EntanglionLocationId,
  componentId: QuantumComponentId,
): GameState {
  return {
    ...state,
    componentLocations: {
      ...state.componentLocations,
      [location]: componentId,
    },
  };
}

export function recycleDeck<TCard extends CardId>(deck: DeckState<TCard>): DeckState<TCard> {
  return {
    drawPile: [...deck.drawPile, ...deck.discardPile],
    discardPile: [],
  };
}

export function hasCollectedAllComponents(state: GameState): boolean {
  return Object.values(state.ships).reduce((count, ship) => count + ship.components.length, 0) >= 8;
}

export function removeComponentFromPlanet(
  state: GameState,
  location: EntanglionLocationId,
): GameState {
  const { [location]: _removed, ...componentLocations } = state.componentLocations;

  return {
    ...state,
    componentLocations,
  };
}
