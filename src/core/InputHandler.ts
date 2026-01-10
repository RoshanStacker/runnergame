export class InputHandler {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Support touch/click for jumping
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.keys.add('Space');
      if (e.button === 2) this.keys.add('ArrowDown');
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.keys.delete('Space');
      if (e.button === 2) this.keys.delete('ArrowDown');
    });
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    window.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.add('Space');
    });
    window.addEventListener('touchend', () => {
      this.keys.delete('Space');
    });
  }

  setKeyPressed(code: string, isPressed: boolean) {
    if (isPressed) {
      this.keys.add(code);
    } else {
      this.keys.delete(code);
    }
  }

  isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  clear() {
    this.keys.clear();
  }
}
