import { Config } from '../config/GameConfig';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { EntityManager } from '../entities/EntityManager';

export enum GameState {
  PLAYING,
  GAME_OVER,
}

export class Engine {
  private config: Config;
  private renderer: Renderer;
  private input: InputHandler;
  private entities: EntityManager;
  private state: GameState = GameState.PLAYING;
  private score: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.config = new Config();
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.entities = new EntityManager(this.config.settings);

    this.renderer.resize(this.config.settings.canvasWidth, this.config.settings.canvasHeight);
    
    // UI elements
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => this.restart();
    }
  }

  start() {
    requestAnimationFrame(() => this.gameLoop());
  }

  private gameLoop() {
    if (this.state === GameState.PLAYING) {
      this.update();
    }
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    const jumpRequested = this.input.isPressed('Space');
    const slideRequested = this.input.isPressed('ArrowDown');
    this.entities.update(this.config.settings, jumpRequested, slideRequested);

    if (this.entities.checkCollisions()) {
      this.gameOver();
    }

    this.score += 1; // Simple score based on frames
    this.updateUI();
  }

  private draw() {
    this.renderer.clear();
    
    // Draw ground
    this.renderer.drawGround(this.config.settings.canvasHeight);

    // Draw player
    const p = this.entities.player;
    this.renderer.drawRect(p.x, p.y, p.width, p.height, p.color, p.isSliding);

    // Draw obstacles
    for (const obs of this.entities.obstacles) {
      this.renderer.drawRect(obs.x, obs.y, obs.width, obs.height, obs.color);
    }
  }

  private updateUI() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.innerText = `Score: ${Math.floor(this.score / 10)}`;
    }
  }

  private gameOver() {
    this.state = GameState.GAME_OVER;
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) {
      gameOverEl.style.display = 'block';
    }
  }

  private restart() {
    this.state = GameState.PLAYING;
    this.score = 0;
    this.entities.reset(this.config.settings);
    this.input.clear();
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) {
      gameOverEl.style.display = 'none';
    }
  }
}
