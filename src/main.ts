import '../style.css'
import { Engine } from './core/Engine'

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (canvas) {
    const game = new Engine(canvas);
    game.start();
  }
});
