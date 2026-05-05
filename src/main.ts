import '../style.css';
import { Engine } from './core/Engine';
import { loadExperimentConfig } from './config/ExperimentConfig';

window.addEventListener('load', async () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const experimentConfig = await loadExperimentConfig();
  const game = new Engine(canvas, experimentConfig);
  game.start();
});
