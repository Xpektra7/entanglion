import * as PIXI from "pixi.js";

import { BOARD_LOCATIONS } from "../data/catalogs.ts";
import { createInitialGameState } from "../engine/state/index.ts";
import { reduceGame } from "../engine/index.ts";
import type { PlayableEngineCardId } from "../types/index.ts";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

let state = createInitialGameState({
  players: {
    "player-1": { playerId: "player-1", shipId: "ship-1", hand: ["x", "h", "the-mechanic"] },
    "player-2": { playerId: "player-2", shipId: "ship-2", hand: ["cnot", "swap", "bennett"] },
  },
  ships: {
    "ship-1": {
      shipId: "ship-1",
      ownerId: "player-1",
      location: { galaxy: "centarious", location: "zero" },
      components: [],
    },
    "ship-2": {
      shipId: "ship-2",
      ownerId: "player-2",
      location: { galaxy: "superious", location: "plus" },
      components: [],
    },
  },
});

type Route = "home" | "game";

const getRoute = (): Route => (window.location.hash === "#game" ? "game" : "home");

let route: Route = getRoute();

const boardHost = document.createElement("div");
boardHost.id = "pixi-board";
boardHost.className = "pixi-board";

let logHost: HTMLDivElement | null = null;

const layout = {
  centarious: ["zero", "one"],
  superious: ["plus", "minus"],
  entanglion: ["omega-zero", "omega-one", "omega-two", "omega-three", "phi-plus", "phi-minus", "psi-plus", "psi-minus"],
} as const;

const boardApp = new PIXI.Application();
await boardApp.init({
  resizeTo: boardHost,
  antialias: true,
  backgroundAlpha: 0,
});

boardHost.appendChild(boardApp.canvas);

const getPlayableEngineCard = (): PlayableEngineCardId | undefined => {
  const hand = state.players[state.currentPlayerId].hand;
  return hand.find((card): card is PlayableEngineCardId => card === "x" || card === "h" || card === "swap" || card === "cnot");
};

const appendLog = (message: string) => {
  if (!logHost) return;
  const item = document.createElement("div");
  item.textContent = message;
  logHost.prepend(item);
};

const renderCardChips = (cards: string[]) => cards.map((card) => `<span class="card-chip">${card}</span>`).join("");

const renderAssetTile = (title: string, subtitle: string, image: string, tone: string) => `
  <article class="asset-tile ${tone}">
    <div class="asset-tile__art" style="background-image: url('${image}')"></div>
    <div class="asset-tile__copy">
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </div>
  </article>
`;

const renderPixi = () => {
  boardApp.stage.removeChildren();

  const background = new PIXI.Graphics();
  background.roundRect(0, 0, boardHost.clientWidth || 900, boardHost.clientHeight || 540, 24);
  background.fill({ color: 0x08111f, alpha: 0.82 });
  background.stroke({ color: 0xffffff, alpha: 0.1, width: 1 });
  boardApp.stage.addChild(background);

  const width = boardHost.clientWidth || 900;
  const height = boardHost.clientHeight || 540;
  const panelWidth = width / 3;

  BOARD_LOCATIONS.forEach((location, index) => {
    const galaxyIndex = location.galaxy === "centarious" ? 0 : location.galaxy === "superious" ? 1 : 2;
    const locationIndex = layout[location.galaxy].indexOf(location.location as never);
    const panelX = galaxyIndex * panelWidth;
    const panel = new PIXI.Graphics();
    panel.roundRect(panelX + 14, 14, panelWidth - 28, height - 28, 22);
    panel.fill({ color: 0xffffff, alpha: galaxyIndex === 2 ? 0.05 : 0.03 });
    panel.stroke({ color: 0xffffff, alpha: 0.1, width: 1 });
    boardApp.stage.addChild(panel);

    const label = new PIXI.Text({
      text: `${location.galaxy.toUpperCase()} · ${location.location}`,
      style: {
        fill: 0xeef2ff,
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 1.2,
      },
    });
    label.position.set(panelX + 26, 28);
    boardApp.stage.addChild(label);

    const nodeYBase = galaxyIndex === 2 ? 92 : height / 2 - 30;
    const nodeSpacing = galaxyIndex === 2 ? 52 : 110;
    const nodeX = panelX + panelWidth / 2;
    const nodeY = nodeYBase + locationIndex * nodeSpacing;

    const node = new PIXI.Graphics();
    node.circle(nodeX, nodeY, galaxyIndex === 2 ? 16 : 20);
    node.fill({ color: galaxyIndex === 2 ? 0x8ae6ff : 0xf8d66d, alpha: 0.75 });
    boardApp.stage.addChild(node);

    const labelText = new PIXI.Text({
      text: location.location,
      style: {
        fill: 0xeef2ff,
        fontSize: 12,
        fontWeight: "600",
      },
    });
    labelText.anchor.set(0.5, 0);
    labelText.position.set(nodeX, nodeY + 26);
    boardApp.stage.addChild(labelText);

    const shipsHere = Object.values(state.ships).filter((ship) => ship.location.galaxy === location.galaxy && ship.location.location === location.location);
    shipsHere.forEach((ship, shipIndex) => {
      const shipMarker = new PIXI.Graphics();
      shipMarker.circle(nodeX + (shipIndex === 0 ? -28 : 28), nodeY - 28, 12);
      shipMarker.fill({ color: ship.ownerId === "player-1" ? 0x8ae6ff : 0xf8d66d, alpha: 0.95 });
      shipMarker.stroke({ color: 0xffffff, alpha: 0.35, width: 1 });
      boardApp.stage.addChild(shipMarker);

      const shipText = new PIXI.Text({
        text: ship.shipId === "ship-1" ? "1" : "2",
        style: { fill: 0x08111f, fontSize: 12, fontWeight: "800" },
      });
      shipText.anchor.set(0.5);
      shipText.position.set(nodeX + (shipIndex === 0 ? -28 : 28), nodeY - 28);
      boardApp.stage.addChild(shipText);
    });
  });
};

const renderHome = () => `
  <div class="shell shell--home">
    <main class="stage stage--hero">
      <div class="hero-grid hero-grid--home">
        <section class="hero-copy">
          <div class="eyebrow">Entanglion Desktop</div>
          <h1 class="title">Rebuild the quantum computer.</h1>
          <p class="subtitle">A tactical tabletop engine with a browser shell that feels like a printed rulebook and a ship console.</p>
          <div class="hero-actions">
            <button class="actions__primary" data-action="enter-game">Enter game</button>
            <a class="actions__link" href="#game">Skip to board</a>
          </div>
          <div class="hero-statline">
            <span>Pure reducer</span>
            <span>Pixi stage</span>
            <span>Data-driven cards</span>
          </div>
        </section>
        <aside class="hero-gallery">
          ${renderAssetTile("Board atlas", "The map that drives every move.", "/images/board.png", "tone-cyan")}
          ${renderAssetTile("Engine deck", "Command cards rendered like relics.", "/images/engine_cards.png", "tone-amber")}
          ${renderAssetTile("Quantum field", "The component set that seals the win.", "/images/quantum_components.png", "tone-ice")}
        </aside>
      </div>
    </main>
  </div>
`;

const renderGame = () => `
    <div class="shell">
      <main class="stage">
        <div class="stage__header stage__header--game">
          <div>
            <div class="eyebrow">Entanglion Desktop</div>
            <h1 class="title">Quantum voyage, engine first.</h1>
            <p class="subtitle">The browser shell borrows the game art language: framed, instrument-like, and ready for playtesting.</p>
          </div>
          <div class="status-stack">
            <div class="status status--pill">Phase: ${state.phase}</div>
            <div class="status status--pill">Player: ${state.currentPlayerId}</div>
            <div class="status status--pill status--danger">Detection: ${state.detectionRate}</div>
          </div>
        </div>
        <div id="board-mount" class="board-mount"></div>
      </main>
      <aside class="sidebar">
        <section class="panel panel--art">
          <div class="panel__art" style="background-image:url('/images/spaceship.png')"></div>
          <div class="panel__copy">
            <h2>Ship console</h2>
            <p>Ship tokens, detection, and board motion read like a cockpit instead of a debug panel.</p>
          </div>
        </section>
        <section class="panel">
          <h2>Actions</h2>
          <div class="actions">
            <button data-action="navigate"><span>Navigate</span><small>Move by card</small></button>
            <button data-action="retrieve"><span>Retrieve</span><small>Search deck</small></button>
            <button data-action="event"><span>Event</span><small>Resolve draw</small></button>
            <button data-action="exchange"><span>Exchange</span><small>Trade a card</small></button>
          </div>
        </section>
        <section class="panel">
          <h3>Hands</h3>
          <div class="hand-block">
            <div class="hand-block__label">Player 1</div>
            <div class="hand-block__chips">${renderCardChips(state.players["player-1"].hand)}</div>
          </div>
          <div class="hand-block">
            <div class="hand-block__label">Player 2</div>
            <div class="hand-block__chips">${renderCardChips(state.players["player-2"].hand)}</div>
          </div>
        </section>
        <section class="panel">
          <h3>Log</h3>
          <div class="log" id="log"></div>
        </section>
      </aside>
    </div>
`;
const render = () => {
  app.innerHTML = route === "game" ? renderGame() : renderHome();

  if (route === "game") {
    logHost = document.querySelector<HTMLDivElement>("#log");
    const boardMount = document.querySelector<HTMLDivElement>("#board-mount");
    if (boardMount && boardHost.parentElement !== boardMount) {
      boardMount.replaceChildren(boardHost);
    }

    renderPixi();
  }
};

app.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target?.matches("button[data-action]")) return;

  const action = target.getAttribute("data-action");
  if (!action) return;

  switch (action) {
    case "enter-game":
      window.location.hash = "#game";
      route = getRoute();
      render();
      return;
    case "navigate": {
      const cardId = getPlayableEngineCard();
      if (!cardId) break;

      state = reduceGame(state, { type: "navigate", playerId: state.currentPlayerId, cardId, target: { galaxy: "centarious", location: "one" } });
      appendLog("Navigate pressed");
      break;
    }
    case "retrieve":
      state = reduceGame(state, { type: "retrieve", playerId: state.currentPlayerId, retrieveRoll: 6 });
      appendLog("Retrieve pressed");
      break;
    case "event":
      appendLog("Event pressed");
      break;
    case "exchange": {
      const cardId = getPlayableEngineCard();
      if (!cardId) break;

      state = reduceGame(state, { type: "exchange", playerId: state.currentPlayerId, cardId });
      appendLog("Exchange pressed");
      break;
    }
  }

  render();
});

window.addEventListener("hashchange", () => {
  route = getRoute();
  render();
});

render();
