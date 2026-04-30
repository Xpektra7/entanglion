# Roadmap

## Repo Prep
- [x] Freeze engine-only folder layout
- [x] Add Bun TypeScript package spine
- [x] Add strict typecheck and test scripts
- [x] Add JSON data loading and validation path
- [x] Define stable internal IDs and enums

## Core Engine
- [x] Create game state model
- [x] Define action model
- [x] Build deterministic reducer entrypoint
- [x] Split board, player, card, quantum, win modules
- [x] Load board and card config from data
- [x] Add initial game state factory
- [x] Add basic state helpers: draw, discard, move, swap

## Rules Coverage
- [x] Setup flow
- [x] Movement flow
- [x] Retrieval flow
- [x] Quantum event flow
- [x] Win/loss checks

## Tests
- [x] Setup scenario test
- [x] Movement scenario test
- [x] Retrieval scenario test
- [x] Event scenario test
- [x] Regression tests for rule fixes

## Later
- [ ] Add web app shell
- [ ] Add PixiJS presentation layer
- [ ] Add Zustand state bridge
