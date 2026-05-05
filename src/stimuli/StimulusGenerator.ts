import { StimulusCategory, StimulusParams, ExperimentSettings } from '../experiment/types';

export class StimulusGenerator {
  private readonly config: ExperimentSettings;

  constructor(config: ExperimentSettings) {
    this.config = config;
  }

  generateTrialSequence(): StimulusParams[] {
    const trials: StimulusParams[] = [];
    for (let i = 0; i < this.config.trial.totalTrials; i++) {
      trials.push(this.generateSingleTrial(i));
    }
    return trials;
  }

  private generateSingleTrial(trialNumber: number): StimulusParams {
    const frequency = this.sampleFrequency();
    const orientation = this.sampleOrientation();
    const category = frequency < this.config.stimulus.categoryBoundary
      ? StimulusCategory.A
      : StimulusCategory.B;

    return { frequency, orientation, category, trialNumber };
  }

  private sampleFrequency(): number {
    const [min, max] = this.config.stimulus.frequencyRange;
    const boundary = this.config.stimulus.categoryBoundary;
    const exclusion = this.config.stimulus.boundaryExclusionZone;

    if (this.config.stimulus.frequencyDistribution === 'boundary') {
      return this.sampleBoundaryDistribution(min, max, boundary, exclusion);
    }
    return this.sampleUniformWithExclusion(min, max, boundary, exclusion);
  }

  private sampleUniformWithExclusion(
    min: number, max: number, boundary: number, exclusion: number,
  ): number {
    const lowerRange = boundary - exclusion - min;
    const upperRange = max - (boundary + exclusion);
    const totalRange = lowerRange + upperRange;

    const r = Math.random() * totalRange;
    if (r < lowerRange) {
      return min + r;
    }
    return boundary + exclusion + (r - lowerRange);
  }

  private sampleBoundaryDistribution(
    min: number, max: number, boundary: number, exclusion: number,
  ): number {
    const nearRange = (max - min) * 0.15;
    const nearMin = Math.max(min, boundary - nearRange);
    const nearMax = Math.min(max, boundary + nearRange);

    if (Math.random() < 0.7) {
      let freq: number;
      do {
        freq = nearMin + Math.random() * (nearMax - nearMin);
      } while (Math.abs(freq - boundary) < exclusion);
      return freq;
    }

    return this.sampleUniformWithExclusion(min, max, boundary, exclusion);
  }

  private sampleOrientation(): number {
    const [min, max] = this.config.stimulus.orientationVariationRange;
    return min + Math.random() * (max - min);
  }
}
