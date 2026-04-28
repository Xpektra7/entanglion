# Roadmap

## Repo Prep
- [ ] Freeze engine-only folder layout
- [ ] Add Bun TypeScript package spine
- [ ] Add strict typecheck and test scripts
- [ ] Add JSON data loading and validation path
- [ ] Define stable internal IDs and enums

## Core Engine
- [ ] Create game state model
- [ ] Define action model
- [ ] Build deterministic reducer entrypoint
- [ ] Split board, player, card, quantum, win modules
- [ ] Load board and card config from data

## Rules Coverage
- [ ] Setup flow
- [ ] Movement flow
- [ ] Retrieval flow
- [ ] Quantum event flow
- [ ] Win/loss checks

## Tests
- [ ] Setup scenario test
- [ ] Movement scenario test
- [ ] Retrieval scenario test
- [ ] Event scenario test
- [ ] Regression tests for rule fixes

## Later
- [ ] Add web app shell
- [ ] Add PixiJS presentation layer
- [ ] Add Zustand state bridge
