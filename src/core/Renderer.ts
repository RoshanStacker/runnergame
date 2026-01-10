
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawRect(x: number, y: number, width: number, height: number, color: string, isSliding: boolean = false) {
    this.ctx.fillStyle = color;
    if (isSliding) {
      // Draw a "flatter" rectangle or add some visual effect for sliding
      this.ctx.globalAlpha = 0.7;
    }
    this.ctx.fillRect(x, y, width, height);
    this.ctx.globalAlpha = 1.0;
  }

  // Draw ground
  drawGround(y: number) {
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();
  }
}
