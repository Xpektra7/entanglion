import type { BoardLocation, DetectionRate, EngineCardId, GameState, ShipId } from "../../types/index.ts";

export function isEntanglionLocation(location: BoardLocation): boolean {
  return location.galaxy === "entanglion";
}

export function isCentariousLocation(location: BoardLocation): boolean {
  return location.galaxy === "centarious";
}

export function isSuperiousLocation(location: BoardLocation): boolean {
  return location.galaxy === "superious";
}

export function isBellState(location: BoardLocation): boolean {
  return (
    location.galaxy === "entanglion" &&
    (location.location === "phi-plus" ||
      location.location === "phi-minus" ||
      location.location === "psi-plus" ||
      location.location === "psi-minus")
  );
}

export function resolveCnotMove(
  lead: BoardLocation,
  other: BoardLocation,
): { lead: BoardLocation; other: BoardLocation } | undefined {
  if (lead.galaxy === "centarious" && other.galaxy === "superious") {
    if (lead.location === "zero" && other.location === "plus") {
      return {
        lead: { galaxy: "entanglion", location: "phi-plus" },
        other: { galaxy: "entanglion", location: "phi-plus" },
      };
    }

    if (lead.location === "zero" && other.location === "minus") {
      return {
        lead: { galaxy: "entanglion", location: "phi-minus" },
        other: { galaxy: "entanglion", location: "phi-minus" },
      };
    }

    if (lead.location === "one" && other.location === "plus") {
      return {
        lead: { galaxy: "entanglion", location: "psi-plus" },
        other: { galaxy: "entanglion", location: "psi-plus" },
      };
    }

    if (lead.location === "one" && other.location === "minus") {
      return {
        lead: { galaxy: "entanglion", location: "psi-minus" },
        other: { galaxy: "entanglion", location: "psi-minus" },
      };
    }
  }

  if (lead.galaxy === "entanglion" && other.galaxy === "entanglion" && isBellState(lead) && lead.location === other.location) {
    if (lead.location === "phi-plus") {
      return {
        lead: { galaxy: "centarious", location: "zero" },
        other: { galaxy: "superious", location: "plus" },
      };
    }

    if (lead.location === "phi-minus") {
      return {
        lead: { galaxy: "centarious", location: "zero" },
        other: { galaxy: "superious", location: "minus" },
      };
    }

    if (lead.location === "psi-plus") {
      return {
        lead: { galaxy: "centarious", location: "one" },
        other: { galaxy: "superious", location: "plus" },
      };
    }

    if (lead.location === "psi-minus") {
      return {
        lead: { galaxy: "centarious", location: "one" },
        other: { galaxy: "superious", location: "minus" },
      };
    }
  }

  return undefined;
}

export function resolveSwapMove(
  shipA: BoardLocation,
  shipB: BoardLocation,
): { shipA: BoardLocation; shipB: BoardLocation } | undefined {
  const outsideEntanglion = !isEntanglionLocation(shipA) && !isEntanglionLocation(shipB);
  if (outsideEntanglion) {
    return {
      shipA: { ...shipB },
      shipB: { ...shipA },
    };
  }

  const insideOmegaSwap =
    shipA.galaxy === "entanglion" &&
    shipB.galaxy === "entanglion" &&
    ((shipA.location === "omega-zero" && shipB.location === "omega-three") ||
      (shipA.location === "omega-three" && shipB.location === "omega-zero"));

  if (!insideOmegaSwap) {
    return undefined;
  }

  return {
    shipA: { ...shipB },
    shipB: { ...shipA },
  };
}

export function getOtherShipId(state: GameState, shipId: ShipId): ShipId {
  return shipId === "ship-1" ? "ship-2" : "ship-1";
}

export function isOrbitalDefenseSafe(roll: number, detectionRate: DetectionRate): boolean {
  return roll > detectionRate;
}

export function resolveEngineMove(
  cardId: EngineCardId,
  location: BoardLocation,
  target: BoardLocation,
): BoardLocation | undefined {
  if (cardId === "x") {
    if (location.galaxy === "centarious" && location.location === "zero" && target.galaxy === "centarious" && target.location === "one") {
      return target;
    }

    if (location.galaxy === "centarious" && location.location === "one" && target.galaxy === "centarious" && target.location === "zero") {
      return target;
    }

    return undefined;
  }

  if (cardId === "h") {
    if (location.galaxy === "centarious" && target.galaxy === "superious") {
      if (location.location === "zero" && (target.location === "plus" || target.location === "minus")) {
        return target;
      }

      if (location.location === "one" && (target.location === "plus" || target.location === "minus")) {
        return target;
      }
    }

    if (location.galaxy === "superious" && target.galaxy === "centarious") {
      if ((location.location === "plus" || location.location === "minus") && (target.location === "zero" || target.location === "one")) {
        return target;
      }
    }

    if (location.galaxy === "entanglion" && target.galaxy === "entanglion") {
      return target;
    }

    return undefined;
  }

  return undefined;
}
