import { GameSettings } from '../config/GameConfig';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  public isSliding: boolean = false;
  private velocityY: number = 0;
  private isGrounded: boolean = false;

  constructor(settings: GameSettings) {
    this.width = settings.playerWidth;
    this.height = settings.playerHeight;
    this.color = settings.playerColor;
    this.x = 50;
    this.y = settings.canvasHeight - this.height;
  }

  update(settings: GameSettings, jumpRequested: boolean, slideRequested: boolean) {
    if (jumpRequested && this.isGrounded && !this.isSliding) {
      this.velocityY = settings.jumpForce;
      this.isGrounded = false;
    }

    this.isSliding = slideRequested && this.isGrounded;

    if (this.isSliding) {
      this.height = settings.playerSlideHeight;
    } else {
      this.height = settings.playerHeight;
    }

    this.velocityY += settings.gravity;
    this.y += this.velocityY;

    const groundY = settings.canvasHeight - this.height;
    if (this.y > groundY) {
      this.y = groundY;
      this.velocityY = 0;
      this.isGrounded = true;
    }
  }

  reset(settings: GameSettings) {
    this.y = settings.canvasHeight - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
  }
}
