# Project Guide

**Goal**
- Build a faithful, modular Entanglion engine first.
- Keep UI, rules, and content separate.
- Design for future expansions from day one.
- Preserve engine purity: no UI, rendering, or framework code in core rules.

**Core Rules**
- Engine logic stays pure and testable.
- UI only renders state and sends actions.
- No game rules inside components.
- Use data, not hardcoded logic, for cards, boards, and effects.
- Prefer data-driven content for new cards, spaces, and effects before adding code branches.

**Naming**
- Use stable internal IDs in code.
- Keep human-facing labels separate for UI and assets.
- Prefer explicit enums over free-form strings.

**Architecture**
- Split by domain: setup, movement, retrieval, events, win/lose.
- Treat card effects and board transitions as isolated modules.
- Make state transitions deterministic: `state + action -> new state`.
- Start with single-package engine-only structure; add web app later after engine settles.

**Extensibility**
- Add new content through config and modules, not rewrites.
- Keep rule changes versioned.
- Preserve backward compatibility only when needed.

**Testing**
- Write interfaces and types before implementations.
- Test rules first.
- Add scenario tests for turn flows.
- Every bug fix gets a regression test.
- Add tests for new rule primitives before expanding content.

**Working Style**
- Start with the smallest correct change.
- Favor clarity over cleverness.
- If a choice affects future expansion, choose the more modular path.
- When unsure, define the rule before coding.
- Keep repo reorganized for build readiness before engine logic work.

**Decision Rule**
- Canonical engine first.
- UI second.
- Expansion-ready always.
