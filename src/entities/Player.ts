import { GameSettings } from '../config/GameConfig';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;
  public isSliding: boolean = false;
  public isStumbling: boolean = false;
  private velocityY: number = 0;
  private isGrounded: boolean = false;
  private stumbleTimer: number = 0;
  private readonly stumbleDurationMs: number = 300;

  constructor(settings: GameSettings) {
    this.width = settings.playerWidth;
    this.height = settings.playerHeight;
    this.color = settings.playerColor;
    this.x = Math.floor(settings.canvasWidth * 0.25);
    this.y = settings.canvasHeight - this.height;
  }

  get isJumping(): boolean {
    return !this.isGrounded;
  }

  update(settings: GameSettings, jumpRequested: boolean, slideRequested: boolean) {
    if (this.isStumbling) {
      if (performance.now() - this.stumbleTimer > this.stumbleDurationMs) {
        this.isStumbling = false;
      }
    }

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

  triggerJump(settings: GameSettings) {
    if (this.isGrounded) {
      this.velocityY = settings.jumpForce;
      this.isGrounded = false;
      this.isSliding = false;
    }
  }

  triggerSlide(settings: GameSettings) {
    if (this.isGrounded) {
      this.isSliding = true;
      this.height = settings.playerSlideHeight;
      this.y = settings.canvasHeight - this.height;
    }
  }

  triggerStumble() {
    this.isStumbling = true;
    this.stumbleTimer = performance.now();
  }

  stopSliding(settings: GameSettings) {
    this.isSliding = false;
    this.height = settings.playerHeight;
    this.y = settings.canvasHeight - this.height;
  }

  reset(settings: GameSettings) {
    this.y = settings.canvasHeight - this.height;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.isStumbling = false;
  }
}
