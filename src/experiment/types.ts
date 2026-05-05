export type PlayerAction = 'jump' | 'slide';
export type ExperimentPhase = 'pre-reversal' | 'post-reversal';
export type FrequencyDistribution = 'uniform' | 'boundary';

export enum StimulusCategory {
  A = 'A',
  B = 'B',
}

export interface StimulusParams {
  frequency: number;
  orientation: number;
  category: StimulusCategory;
  trialNumber: number;
}

export interface TrialData {
  trialNumber: number;
  frequency: number;
  orientation: number;
  correctCategory: StimulusCategory;
  correctAction: PlayerAction;
  playerResponse: PlayerAction;
  isCorrect: boolean;
  reactionTimeMs: number;
  timestamp: number;
  phase: ExperimentPhase;
  healthBefore: number;
  healthAfter: number;
}

export interface ExperimentLog {
  experimentId: string;
  startTime: number;
  endTime: number | null;
  config: ExperimentSettings;
  trials: TrialData[];
}

export interface StimulusConfig {
  frequencyRange: [number, number];
  categoryBoundary: number;
  frequencyDistribution: FrequencyDistribution;
  boundaryExclusionZone: number;
  orientationVariationRange: [number, number];
  gratingWidth: number;
  gratingHeight: number;
  jumpRevealHeight: number;
  approachDistance: number;
  contrast: number;
}

export interface TrialConfig {
  totalTrials: number;
  reversalAfterTrial: number;
  interTrialRunDistance: number;
  slowdownDistance: number;
  stopDistance: number;
  minSpeed: number;
  responseTimeoutMs: number;
}

export interface HealthConfig {
  visible: boolean;
  max: number;
  initial: number;
  correctHeal: number;
  incorrectDamage: number;
  regenRate: number;
  regenIntervalMs: number;
  floor: number;
}

export interface DisplayConfig {
  showTrialCounter: boolean;
  showFeedbackBorder: boolean;
  showFeedbackIcon: boolean;
  feedbackDurationMs: number;
  correctColor: string;
  incorrectColor: string;
}

export interface ExperimentSettings {
  stimulus: StimulusConfig;
  trial: TrialConfig;
  health: HealthConfig;
  display: DisplayConfig;
}
