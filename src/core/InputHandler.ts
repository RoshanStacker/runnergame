export class InputHandler {
  private keys: Set<string> = new Set();
  private justPressed: Set<string> = new Set();
  private pressTimestamps: Map<string, number> = new Map();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
        this.pressTimestamps.set(e.code, performance.now());
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        if (!this.keys.has('Space')) {
          this.justPressed.add('Space');
          this.pressTimestamps.set('Space', performance.now());
        }
        this.keys.add('Space');
      }
      if (e.button === 2) {
        if (!this.keys.has('ArrowDown')) {
          this.justPressed.add('ArrowDown');
          this.pressTimestamps.set('ArrowDown', performance.now());
        }
        this.keys.add('ArrowDown');
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.keys.delete('Space');
      if (e.button === 2) this.keys.delete('ArrowDown');
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  setKeyPressed(code: string, isPressed: boolean) {
    if (isPressed) {
      if (!this.keys.has(code)) {
        this.justPressed.add(code);
        this.pressTimestamps.set(code, performance.now());
      }
      this.keys.add(code);
    } else {
      this.keys.delete(code);
    }
  }

  isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  wasJustPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  getPressTimestamp(code: string): number | undefined {
    return this.pressTimestamps.get(code);
  }

  clearJustPressed() {
    this.justPressed.clear();
  }

  clear() {
    this.keys.clear();
    this.justPressed.clear();
    this.pressTimestamps.clear();
  }
}
