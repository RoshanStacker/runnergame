export interface GameSettings {
  gravity: number;
  jumpForce: number;
  playerWidth: number;
  playerHeight: number;
  playerColor: string;
  playerSlideHeight: number;
  obstacleSpeed: number;
  obstacleMinGap: number;
  obstacleMaxGap: number;
  obstacleWidth: number;
  obstacleHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

export const DefaultSettings: GameSettings = {
  gravity: 0.6,
  jumpForce: -12,
  playerWidth: 40,
  playerHeight: 40,
  playerColor: '#646cff',
  playerSlideHeight: 20,
  obstacleSpeed: 5,
  obstacleMinGap: 200,
  obstacleMaxGap: 500,
  obstacleWidth: 30,
  obstacleHeight: 60,
  canvasWidth: 800,
  canvasHeight: 400,
};

export class Config {
  public settings: GameSettings;

  constructor(customSettings: Partial<GameSettings> = {}) {
    this.settings = { ...DefaultSettings, ...customSettings };
  }

  update(newSettings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }
}
