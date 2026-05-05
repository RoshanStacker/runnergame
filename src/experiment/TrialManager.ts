import { ExperimentSettings, ExperimentPhase, PlayerAction, StimulusCategory, StimulusParams } from './types';
import { StimulusGenerator } from '../stimuli/StimulusGenerator';

export class TrialManager {
  private currentTrial: number = 0;
  private readonly totalTrials: number;
  private readonly reversalTrial: number;
  private isReversed: boolean = false;
  private readonly trialSequence: StimulusParams[];

  constructor(config: ExperimentSettings) {
    this.totalTrials = config.trial.totalTrials;
    this.reversalTrial = config.trial.reversalAfterTrial;
    const generator = new StimulusGenerator(config);
    this.trialSequence = generator.generateTrialSequence();
  }

  getCurrentTrialNumber(): number {
    return this.currentTrial;
  }

  getTotalTrials(): number {
    return this.totalTrials;
  }

  isExperimentComplete(): boolean {
    return this.currentTrial >= this.totalTrials;
  }

  getCurrentPhase(): ExperimentPhase {
    return this.isReversed ? 'post-reversal' : 'pre-reversal';
  }

  getNextTrial(): StimulusParams {
    return this.trialSequence[this.currentTrial];
  }

  getCategoryAction(category: StimulusCategory): PlayerAction {
    if (this.isReversed) {
      return category === StimulusCategory.A ? 'slide' : 'jump';
    }
    return category === StimulusCategory.A ? 'jump' : 'slide';
  }

  advanceTrial() {
    this.currentTrial++;
    if (this.currentTrial === this.reversalTrial) {
      this.isReversed = true;
    }
  }
}
