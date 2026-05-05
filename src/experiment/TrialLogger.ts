import { ExperimentLog, ExperimentSettings, TrialData } from './types';

export class TrialLogger {
  private log: ExperimentLog;

  constructor(config: ExperimentSettings) {
    this.log = {
      experimentId: crypto.randomUUID(),
      startTime: Date.now(),
      endTime: null,
      config,
      trials: [],
    };
  }

  recordTrial(data: TrialData) {
    this.log.trials.push(data);
  }

  finalize() {
    this.log.endTime = Date.now();
  }

  getLog(): ExperimentLog {
    return this.log;
  }

  getTrialCount(): number {
    return this.log.trials.length;
  }

  downloadAsJson() {
    this.finalize();
    const blob = new Blob([JSON.stringify(this.log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${this.log.experimentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
