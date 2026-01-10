import { GameSettings } from '../config/GameConfig';

export enum ObstacleType {
  GROUND,
  AIR,
}

export class Obstacle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  public type: ObstacleType;

  constructor(settings: GameSettings, startX: number, type: ObstacleType = ObstacleType.GROUND) {
    this.type = type;
    this.width = settings.obstacleWidth;
    this.height = settings.obstacleHeight;
    this.x = startX;
    
    if (this.type === ObstacleType.GROUND) {
      this.y = settings.canvasHeight - this.height;
      this.color = '#ff4d4d'; // Red for ground obstacles
    } else {
      // Air obstacle, player must slide under it
      // Position it so it's too high to jump over, but low enough to hit a standing player
      // Player jump height: approx (v^2)/(2g) = (12^2)/(2*0.6) = 144 / 1.2 = 120 pixels
      // Canvas height is 400. Ground is at 400.
      // Player head is at 400 - 40 = 360 when standing.
      // Player head is at 400 - 20 = 380 when sliding.
      // Obstacle bottom should be between 360 and 380.
      this.height = settings.obstacleHeight;
      // y is the top of the obstacle. 
      // Bottom of obstacle = y + height.
      // We want y + height to be around 375.
      // y = 375 - 60 = 315.
      this.y = settings.canvasHeight - 85; 
      this.color = '#ffcc00'; // Yellow/Orange for air obstacles
    }
  }

  update(settings: GameSettings) {
    this.x -= settings.obstacleSpeed;
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
