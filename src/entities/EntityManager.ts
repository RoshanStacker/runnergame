import { GameSettings } from '../config/GameConfig';
import { Player } from './Player';
import { Obstacle, ObstacleType } from './Obstacle';

export class EntityManager {
  public player: Player;
  public obstacles: Obstacle[] = [];

  constructor(settings: GameSettings) {
    this.player = new Player(settings);
  }

  update(settings: GameSettings, jumpRequested: boolean, slideRequested: boolean) {
    this.player.update(settings, jumpRequested, slideRequested);

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].update(settings);
      if (this.obstacles[i].isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn obstacles
    if (this.obstacles.length === 0 || 
        (settings.canvasWidth - this.obstacles[this.obstacles.length - 1].x) > this.getNextGap(settings)) {
      this.spawnObstacle(settings);
    }
  }

  private getNextGap(settings: GameSettings): number {
    return Math.random() * (settings.obstacleMaxGap - settings.obstacleMinGap) + settings.obstacleMinGap;
  }

  private spawnObstacle(settings: GameSettings) {
    const type = Math.random() > 0.7 ? ObstacleType.AIR : ObstacleType.GROUND;
    const obstacle = new Obstacle(settings, settings.canvasWidth, type);
    this.obstacles.push(obstacle);
  }

  checkCollisions(): boolean {
    for (const obstacle of this.obstacles) {
      if (
        this.player.x < obstacle.x + obstacle.width &&
        this.player.x + this.player.width > obstacle.x &&
        this.player.y < obstacle.y + obstacle.height &&
        this.player.y + this.player.height > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  }

  reset(settings: GameSettings) {
    this.player.reset(settings);
    this.obstacles = [];
  }
}
