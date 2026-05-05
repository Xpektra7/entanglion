export type PlayerId = "player-1" | "player-2";

export type ShipId = "ship-1" | "ship-2";

export type GalaxyId = "centarious" | "superious" | "entanglion";

export type CentariousLocationId = "zero" | "one";

export type SuperiousLocationId = "plus" | "minus";

export type EntanglionLocationId =
  | "omega-zero"
  | "omega-one"
  | "omega-two"
  | "omega-three"
  | "phi-plus"
  | "phi-minus"
  | "psi-plus"
  | "psi-minus";

export type LocationId =
  | CentariousLocationId
  | SuperiousLocationId
  | EntanglionLocationId;

export type BoardLocation = {
  galaxy: GalaxyId;
  location: LocationId;
};

export type BoardLocationKey = `${GalaxyId}:${LocationId}`;

export type EngineCardId = "x" | "h" | "swap" | "cnot" | "probe";

export type PlayableEngineCardId = Exclude<EngineCardId, "probe">;

export type EventCardId =
  | "bennett"
  | "bit-flip-error"
  | "heisenberg"
  | "quantum-shuffle"
  | "quantum-tunnel"
  | "schrodinger"
  | "spooky-action"
  | "the-mechanic"
  | "wave-function-collapse";

export type QuantumComponentId =
  | "physical-qubits"
  | "qubit-interconnect"
  | "dilution-refrigerator"
  | "quantum-gates"
  | "quantum-programming"
  | "quantum-error-correction"
  | "control-infrastructure"
  | "magnetic-shielding";

export type CardId = EngineCardId | EventCardId;

export type HandCardId = PlayableEngineCardId | EventCardId;

export type NavigateAction = {
  type: "navigate";
  playerId: PlayerId;
  cardId: PlayableEngineCardId;
  target: BoardLocation;
  entanglionRoll?: number;
  centariousRoll?: number;
  entanglionReroll?: number;
  probeRoll?: number;
  probeReroll?: number;
};

export type ExchangeAction = {
  type: "exchange";
  playerId: PlayerId;
  cardId: PlayableEngineCardId;
};

export type RetrieveAction = {
  type: "retrieve";
  playerId: PlayerId;
  retrieveRoll?: number;
  retrieveReroll?: number;
};

export type PlayEventAction = {
  type: "play-event";
  playerId: PlayerId;
  cardId: EventCardId;
  bennettDirection?: "give" | "receive";
  heisenbergRoll?: number;
  spookyRoll?: number;
  spookyComponentIndex?: number;
  probeRoll?: number;
  probeReroll?: number;
};

export type GameAction =
  | NavigateAction
  | ExchangeAction
  | RetrieveAction
  | PlayEventAction;

export type DetectionRate = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type GamePhase = "setup" | "playing" | "won" | "lost";

export type ShipState = {
  shipId: ShipId;
  ownerId: PlayerId;
  location: BoardLocation;
  components: QuantumComponentId[];
};

export type PlayerState = {
  playerId: PlayerId;
  hand: HandCardId[];
  shipId: ShipId;
};

export type DeckState<TCard extends CardId = CardId> = {
  drawPile: TCard[];
  discardPile: TCard[];
};

export type GameState = {
  phase: GamePhase;
  currentPlayerId: PlayerId;
  detectionRate: DetectionRate;
  pendingFreeAction: "quantum-tunnel" | null;
  players: Record<PlayerId, PlayerState>;
  ships: Record<ShipId, ShipState>;
  engineDeck: DeckState<EngineCardId>;
  eventDeck: DeckState<EventCardId>;
  componentLocations: Partial<Record<EntanglionLocationId, QuantumComponentId>>;
  remainingComponents: QuantumComponentId[];
};
