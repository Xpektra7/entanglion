import type {
  BoardLocation,
  BoardLocationKey,
  CentariousLocationId,
  EngineCardId,
  EntanglionLocationId,
  EventCardId,
  GalaxyId,
  QuantumComponentId,
  SuperiousLocationId,
} from "../types/index.ts";

export const GALAXIES: GalaxyId[] = ["centarious", "superious", "entanglion"];

export const CENTARIOUS_LOCATIONS: CentariousLocationId[] = ["zero", "one"];

export const SUPERIOUS_LOCATIONS: SuperiousLocationId[] = ["plus", "minus"];

export const ENTANGLION_LOCATIONS: EntanglionLocationId[] = [
  "omega-zero",
  "omega-one",
  "omega-two",
  "omega-three",
  "phi-plus",
  "phi-minus",
  "psi-plus",
  "psi-minus",
];

export const ENTANGLION_CLOCKWISE_LOCATIONS: EntanglionLocationId[] = [
  "omega-one",
  "omega-two",
  "omega-three",
  "phi-plus",
  "phi-minus",
  "psi-plus",
  "psi-minus",
  "omega-zero",
];

export const BELL_STATE_LOCATIONS: EntanglionLocationId[] = [
  "phi-plus",
  "phi-minus",
  "psi-plus",
  "psi-minus",
];

export const BOARD_LOCATIONS: BoardLocation[] = [
  ...CENTARIOUS_LOCATIONS.map((location) => ({ galaxy: "centarious" as const, location })),
  ...SUPERIOUS_LOCATIONS.map((location) => ({ galaxy: "superious" as const, location })),
  ...ENTANGLION_LOCATIONS.map((location) => ({ galaxy: "entanglion" as const, location })),
];

export const ENGINE_CARDS: EngineCardId[] = ["x", "h", "swap", "cnot", "probe"];

export const EVENT_CARDS: EventCardId[] = [
  "bennett",
  "bit-flip-error",
  "heisenberg",
  "quantum-shuffle",
  "quantum-tunnel",
  "schrodinger",
  "spooky-action",
  "the-mechanic",
  "wave-function-collapse",
];

export const QUANTUM_COMPONENTS: QuantumComponentId[] = [
  "physical-qubits",
  "qubit-interconnect",
  "dilution-refrigerator",
  "quantum-gates",
  "quantum-programming",
  "quantum-error-correction",
  "control-infrastructure",
  "magnetic-shielding",
];

export const INITIAL_DETECTION_RATE = 1;

export const MAX_DETECTION_RATE = 8;

export const STARTING_HAND_SIZE = 3;

export const ENGINE_CONTROL_SLOT_COUNT = 6;

export const GAME_BOARD: Record<BoardLocationKey, BoardLocation> = Object.fromEntries(
  BOARD_LOCATIONS.map((location) => [`${location.galaxy}:${location.location}`, location]),
) as Record<BoardLocationKey, BoardLocation>;
