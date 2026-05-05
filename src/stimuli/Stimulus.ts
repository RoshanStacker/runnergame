import { StimulusCategory, PlayerAction } from '../experiment/types';
import { GratingRenderer } from './GratingRenderer';

export class Stimulus {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public readonly frequency: number;
  public readonly orientation: number;
  public readonly category: StimulusCategory;
  public readonly correctAction: PlayerAction;
  public currentCanvas: HTMLCanvasElement;

  private readonly ambiguousCanvas: HTMLCanvasElement;
  private readonly revealedCanvas: HTMLCanvasElement;

  // y targets
  private readonly groundY: number;      // jump obstacle sits on ground
  private readonly airY: number;         // slide obstacle is elevated
  private readonly ambiguousY: number;   // approach: always sits on ground (no position hint)

  // revealed dimensions (may differ from ambiguous for jump category)
  private readonly revealedWidth: number;
  private readonly revealedHeight: number;

  constructor(
    x: number,
    canvasHeight: number,
    width: number,
    height: number,
    jumpRevealHeight: number,
    frequency: number,
    orientation: number,
    category: StimulusCategory,
    correctAction: PlayerAction,
    contrast: number,
  ) {
    this.x = x;
    this.width = width;
    this.height = height;
    this.frequency = frequency;
    this.orientation = orientation;
    this.category = category;
    this.correctAction = correctAction;

    // Always start sitting on ground — position doesn't reveal category
    this.ambiguousY = canvasHeight - height;
    this.y = this.ambiguousY;

    if (correctAction === 'jump') {
      // Shorter obstacle the player must jump over
      this.revealedWidth = width;
      this.revealedHeight = jumpRevealHeight;
      this.groundY = canvasHeight - jumpRevealHeight;
      this.airY = canvasHeight - height - 30; // unused for jump, but keep symmetry
    } else {
      // Same height, elevated so standing player collides, sliding player passes under
      // Bottom sits at canvasHeight - 30, giving ~30px gap above ground for slide
      this.revealedWidth = width;
      this.revealedHeight = height;
      this.groundY = canvasHeight - height; // unused for slide
      this.airY = canvasHeight - height - 30;
    }

    // Pre-render both sizes
    this.ambiguousCanvas = GratingRenderer.render(width, height, frequency, orientation, contrast);
    this.revealedCanvas = GratingRenderer.render(
      this.revealedWidth, this.revealedHeight, frequency, orientation, contrast,
    );
    this.currentCanvas = this.ambiguousCanvas;
  }

  update(speed: number) {
    this.x -= speed;
  }

  /** Instantly snap to the revealed category position and size. */
  reveal() {
    this.currentCanvas = this.revealedCanvas;
    this.width = this.revealedWidth;
    this.height = this.revealedHeight;
    this.y = this.correctAction === 'jump' ? this.groundY : this.airY;
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
