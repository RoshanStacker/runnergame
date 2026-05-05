export class GratingRenderer {
  static render(
    width: number,
    height: number,
    frequency: number,
    orientationDeg: number,
    contrast: number,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const theta = (orientationDeg * Math.PI) / 180;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const twoPiFreq = 2 * Math.PI * frequency;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const d = px * cosT + py * sinT;
        const luminance = 0.5 + 0.5 * contrast * Math.sin(twoPiFreq * d);
        const value = Math.floor(luminance * 255);
        const i = (py * width + px) * 4;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}
