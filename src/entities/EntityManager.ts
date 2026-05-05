import { GameSettings } from '../config/GameConfig';
import { Player } from './Player';
import { Stimulus } from '../stimuli/Stimulus';

export class EntityManager {
  public player: Player;
  public currentStimulus: Stimulus | null = null;

  constructor(settings: GameSettings) {
    this.player = new Player(settings);
  }

  update(settings: GameSettings, jumpRequested: boolean, slideRequested: boolean) {
    this.player.update(settings, jumpRequested, slideRequested);
    if (this.currentStimulus) {
      this.currentStimulus.update(settings.currentSpeed);
    }
  }

  setStimulus(stimulus: Stimulus) {
    this.currentStimulus = stimulus;
  }

  clearStimulus() {
    this.currentStimulus = null;
  }

  checkCollision(): boolean {
    if (!this.currentStimulus) return false;
    const p = this.player;
    const s = this.currentStimulus;
    return (
      p.x < s.x + s.width &&
      p.x + p.width > s.x &&
      p.y < s.y + s.height &&
      p.y + p.height > s.y
    );
  }

  reset(settings: GameSettings) {
    this.player.reset(settings);
    this.currentStimulus = null;
  }
}
