# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server
npm run build      # Type-check (tsc) then build for production
npm run preview    # Preview production build locally
```

No test framework is configured.

## Architecture

This is a TypeScript + Vite + HTML5 Canvas endless runner game built for neuroscience experiments.

**Data flow:** `main.ts` creates a canvas element and instantiates `Engine`, which owns all subsystems and runs the `requestAnimationFrame` loop. Each frame: `InputHandler` state is read → `EntityManager.update()` advances physics → `Engine.checkCollisions()` triggers game-over → `Renderer` draws the frame.

**Key design principle:** All tunable parameters live in `GameConfig.ts` as the `GameSettings` interface with defaults in `DefaultSettings`. The `Config` class wraps these and exposes `Config.update(Partial<GameSettings>)` for runtime changes — this is the intended hook for experiment logic (dynamic difficulty, timing windows, etc.).

**Module responsibilities:**
- `Engine.ts` — game loop, state machine (`PLAYING` / `GAME_OVER`), score counter, mobile control wiring, UI element manipulation
- `Renderer.ts` — all canvas draw calls; receives data, owns no game state
- `InputHandler.ts` — keyboard/mouse/touch → named key map; exposes `isPressed()` and `setKeyPressed()` (the latter used by mobile button touch events)
- `EntityManager.ts` — player + obstacle lifecycle, physics tick, procedural obstacle spawning, collision detection
- `Player.ts` / `Obstacle.ts` — entity data and per-entity physics/state

**Extending for experiments:** Hook into `Engine.ts` for event logging (obstacle spawn, jump, collision timing). Use `Config.update()` to adjust parameters mid-session. Extend `Renderer.ts` and `Obstacle.ts` to add custom visual stimuli.
