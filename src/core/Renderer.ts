import { Stimulus } from '../stimuli/Stimulus';

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
    if (isSliding) this.ctx.globalAlpha = 0.7;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.globalAlpha = 1.0;
  }

  drawGround(y: number) {
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();
  }

  drawGrating(stimulus: Stimulus) {
    this.ctx.drawImage(stimulus.currentCanvas, stimulus.x, stimulus.y, stimulus.width, stimulus.height);
  }

  drawGratingWithFeedback(stimulus: Stimulus, color: string, borderWidth: number) {
    this.drawGrating(stimulus);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      stimulus.x - borderWidth / 2,
      stimulus.y - borderWidth / 2,
      stimulus.width + borderWidth,
      stimulus.height + borderWidth,
    );
    this.ctx.lineWidth = 1;
  }

  drawFeedbackIcon(x: number, y: number, isCorrect: boolean, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 32px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(isCorrect ? '\u2713' : '\u2717', x, y);
    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic';
  }

  /** Full-screen colored flash + large icon, fades in and out over [0-1] progress. */
  drawFeedbackOverlay(isCorrect: boolean, correctColor: string, incorrectColor: string, progress: number) {
    const color = isCorrect ? correctColor : incorrectColor;
    const alpha = 0.25 * Math.sin(Math.PI * progress);

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalAlpha = Math.min(1, progress * 3);
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 72px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(isCorrect ? '\u2713' : '\u2717', this.canvas.width / 2, this.canvas.height / 2 - 40);
    this.ctx.restore();
  }

  drawHealthBar(healthPercent: number, x: number, y: number, width: number, height: number) {
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, width, height);
    const r = Math.floor(255 * (1 - healthPercent));
    const g = Math.floor(255 * healthPercent);
    this.ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
    this.ctx.fillRect(x, y, width * healthPercent, height);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  drawTrialCounter(current: number, total: number, x: number, y: number) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Trial ${current}/${total}`, x, y);
  }

  drawPromptText(text: string, x: number, y: number) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.font = '22px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
    this.ctx.textAlign = 'start';
  }
}
