import { ExperimentSettings } from '../experiment/types';

export async function loadExperimentConfig(): Promise<ExperimentSettings> {
  const response = await fetch('/config/experiment.json');
  if (!response.ok) {
    throw new Error(`Failed to load experiment config: ${response.statusText}`);
  }
  return response.json() as Promise<ExperimentSettings>;
}
