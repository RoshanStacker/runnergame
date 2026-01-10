# Neuroscience Runner Game - Version 2

This is a modular 2D endless runner game designed for neuroscience experiments. Built with TypeScript, Vite, and HTML5 Canvas.

## Gameplay Mechanics

- **Jump**: Press `Space`, click the left mouse button, or touch the screen to jump over ground obstacles.
- **Slide**: Press `ArrowDown` or click the right mouse button to slide under air obstacles.

## Architecture

The project is designed with modularity in mind, allowing experimenters to easily modify game logic, physics, and configurations.

### Directory Structure

- `src/core/`: Core game engine components.
  - `Engine.ts`: Manages the main game loop, state transitions, and coordination between modules.
  - `Renderer.ts`: Encapsulates all drawing logic to the HTML5 Canvas.
  - `InputHandler.ts`: Manages user input (Keyboard, Mouse, Touch).
- `src/entities/`: Game objects.
  - `Player.ts`: Logic for the player character (physics, jumping).
  - `Obstacle.ts`: Logic for individual obstacles.
  - `EntityManager.ts`: Manages the lifecycle of entities (spawning, updating, collision detection).
- `src/config/`: Configuration management.
  - `GameConfig.ts`: Centralized configuration for all game parameters (gravity, speed, dimensions).

### Modularity for Experiments

The `Config` class and `GameSettings` interface allow for dynamic adjustment of game parameters. For neuroscience experiments, this can be extended to:
- Dynamically change difficulty.
- Adjust timing windows for response measurements.
- Toggle features for different experimental conditions.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Version 2 Features

- Smooth 60fps game loop.
- Responsive jumping and sliding mechanics.
- Diverse obstacles (Ground and Air types).
- Procedural obstacle spawning with randomized types.
- Basic scoring system.
- Game over and restart functionality.
- Mobile and Desktop friendly (touch, mouse, keyboard support).

## Future Extensions for Neuroscience

- **Event Logging**: Hook into `Engine.ts` to log precisely when obstacles appear, when the player jumps, and when collisions occur.
- **Dynamic Difficulty**: Use `Config.update()` to change game parameters in real-time based on player performance.
- **Custom Stimuli**: Extend `Renderer.ts` and `Obstacle.ts` to support different shapes, colors, or patterns for cognitive tests.
