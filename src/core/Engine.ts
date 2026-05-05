import { Config } from '../config/GameConfig';
import { ExperimentSettings, PlayerAction } from '../experiment/types';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { EntityManager } from '../entities/EntityManager';
import { TrialManager } from '../experiment/TrialManager';
import { TrialLogger } from '../experiment/TrialLogger';
import { HealthBar } from '../experiment/HealthBar';
import { Stimulus } from '../stimuli/Stimulus';

export enum GameState {
  RUNNING,
  STIMULUS_APPROACHING,  // grating visible, early input accepted
  AWAITING_RESPONSE,     // grating at stop distance, must respond
  ANIMATING_RESPONSE,    // physics running, grating passing player
  SHOWING_FEEDBACK,      // feedback overlay + grating lingering
  EXPERIMENT_COMPLETE,
}

// Multiply baseSpeed by this during ANIMATING to carry grating past player within jump arc
const ANIM_SPEED_FACTOR = 1.6;
// Slow speed during SHOWING_FEEDBACK so grating lingers on screen
const FEEDBACK_SPEED_FACTOR = 0.4;
const ANIMATION_DURATION_MS = 700;

export class Engine {
  private config: Config;
  private experimentConfig: ExperimentSettings;
  private renderer: Renderer;
  private input: InputHandler;
  private entities: EntityManager;

  private trialManager: TrialManager;
  private trialLogger: TrialLogger;
  private healthBar: HealthBar;

  private state: GameState = GameState.RUNNING;
  private distanceSinceLastTrial: number = 0;

  // Set when the stimulus first appears on screen (for accurate RT measurement)
  private stimulusOnsetTime: number = 0;

  // Early or on-time response, committed when grating reaches stop distance
  private pendingResponse: PlayerAction | null = null;
  private pendingPressTime: number = 0;

  // Committed response for the current trial
  private playerResponse: PlayerAction | null = null;
  private trialIsCorrect: boolean = false;

  private animationStartTime: number = 0;
  private feedbackStartTime: number = 0;

  constructor(canvas: HTMLCanvasElement, experimentConfig: ExperimentSettings) {
    this.experimentConfig = experimentConfig;
    this.config = new Config();
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.entities = new EntityManager(this.config.settings);

    this.trialManager = new TrialManager(experimentConfig);
    this.trialLogger = new TrialLogger(experimentConfig);
    this.healthBar = new HealthBar(experimentConfig.health);

    this.renderer.resize(this.config.settings.canvasWidth, this.config.settings.canvasHeight);
    this.setupMobileControls();
    this.setupDownloadButton();
  }

  private setupMobileControls() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || hasTouch) {
      const mobileControls = document.getElementById('mobile-controls');
      const instructions = document.getElementById('instructions');
      if (mobileControls) mobileControls.style.display = 'flex';
      if (instructions) instructions.style.display = 'none';

      const jumpBtn = document.getElementById('jump-btn');
      const slideBtn = document.getElementById('slide-btn');

      if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); this.input.setKeyPressed('Space', true); });
        jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); this.input.setKeyPressed('Space', false); });
      }
      if (slideBtn) {
        slideBtn.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); this.input.setKeyPressed('ArrowDown', true); });
        slideBtn.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); this.input.setKeyPressed('ArrowDown', false); });
      }
    }
  }

  private setupDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.trialLogger.downloadAsJson();
    }
  }

  start() {
    requestAnimationFrame(() => this.gameLoop());
  }

  private gameLoop() {
    this.update();
    this.draw();
    this.input.clearJustPressed();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    switch (this.state) {
      case GameState.RUNNING:             this.updateRunning(); break;
      case GameState.STIMULUS_APPROACHING: this.updateStimulusApproaching(); break;
      case GameState.AWAITING_RESPONSE:   this.updateAwaitingResponse(); break;
      case GameState.ANIMATING_RESPONSE:  this.updateAnimatingResponse(); break;
      case GameState.SHOWING_FEEDBACK:    this.updateShowingFeedback(); break;
      case GameState.EXPERIMENT_COMPLETE: break;
    }
  }

  // ─── State handlers ───────────────────────────────────────────────────────

  private updateRunning() {
    this.config.update({ currentSpeed: this.config.settings.baseSpeed });
    this.entities.update(this.config.settings, false, false);
    this.healthBar.updateRegen();
    this.distanceSinceLastTrial += this.config.settings.currentSpeed;

    if (this.distanceSinceLastTrial >= this.experimentConfig.trial.interTrialRunDistance) {
      if (this.trialManager.isExperimentComplete()) {
        this.state = GameState.EXPERIMENT_COMPLETE;
        this.trialLogger.finalize();
        const el = document.getElementById('experiment-complete');
        if (el) el.style.display = 'flex';
        return;
      }
      this.spawnNextStimulus();
      this.state = GameState.STIMULUS_APPROACHING;
    }
  }

  private updateStimulusApproaching() {
    const stimulus = this.entities.currentStimulus!;
    const playerRight = this.entities.player.x + this.entities.player.width;
    const distanceToPlayer = stimulus.x - playerRight;
    const { slowdownDistance, stopDistance, minSpeed } = this.experimentConfig.trial;
    const baseSpeed = this.config.settings.baseSpeed;

    // Accept early input at any point during approach
    this.checkForInput();

    if (this.pendingResponse) {
      // Speed up to deliver grating to stop distance quickly
      this.config.update({ currentSpeed: baseSpeed * 1.5 });
    } else if (distanceToPlayer <= slowdownDistance) {
      // Normal eased deceleration
      const t = Math.max(0, (distanceToPlayer-stopDistance+50) / slowdownDistance);
      this.config.update({ currentSpeed: minSpeed + (baseSpeed - minSpeed) * t * t });
    }

    this.entities.update(this.config.settings, false, false);

    if (distanceToPlayer <= stopDistance) {
      if (this.pendingResponse) {
        // Early response ready — commit and animate immediately
        this.commitAndAnimate();
      } else {
        // No response yet — park and wait
        this.config.update({ currentSpeed: minSpeed });
        this.state = GameState.AWAITING_RESPONSE;
      }
    }
  }

  private updateAwaitingResponse() {
    this.config.update({ currentSpeed: this.experimentConfig.trial.minSpeed });
    this.entities.update(this.config.settings, false, false);
    this.checkForInput();
    if (this.pendingResponse) {
      this.commitAndAnimate();
    }
  }

  private updateAnimatingResponse() {
    const elapsed = performance.now() - this.animationStartTime;
    this.config.update({ currentSpeed: this.config.settings.baseSpeed * ANIM_SPEED_FACTOR });

    // Keep slide held during animation if that was the choice
    const slideHeld = this.playerResponse === 'slide';
    this.entities.update(this.config.settings, false, slideHeld);

    // Only flag stumble for incorrect responses
    if (!this.trialIsCorrect && this.entities.checkCollision()) {
      this.entities.player.triggerStumble();
    }

    if (elapsed >= ANIMATION_DURATION_MS) {
      if (this.playerResponse === 'slide') {
        this.entities.player.stopSliding(this.config.settings);
      }
      this.recordTrial();
      this.feedbackStartTime = performance.now();
      this.state = GameState.SHOWING_FEEDBACK;
    }
  }

  private updateShowingFeedback() {
    const elapsed = performance.now() - this.feedbackStartTime;
    // Slow scroll so the grating lingers on screen during feedback
    this.config.update({ currentSpeed: this.config.settings.baseSpeed * FEEDBACK_SPEED_FACTOR });
    this.entities.update(this.config.settings, false, false);

    if (elapsed >= this.experimentConfig.display.feedbackDurationMs) {
      this.entities.clearStimulus();
      this.distanceSinceLastTrial = 0;
      this.playerResponse = null;
      this.pendingResponse = null;
      this.trialManager.advanceTrial();
      this.state = GameState.RUNNING;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Poll input and store first press as pending response. */
  private checkForInput() {
    if (this.pendingResponse) return;
    if (this.input.wasJustPressed('Space')) {
      this.pendingResponse = 'jump';
      this.pendingPressTime = this.input.getPressTimestamp('Space') ?? performance.now();
    } else if (this.input.wasJustPressed('ArrowDown')) {
      this.pendingResponse = 'slide';
      this.pendingPressTime = this.input.getPressTimestamp('ArrowDown') ?? performance.now();
    }
  }

  /** Commit the pending response and transition to ANIMATING_RESPONSE. */
  private commitAndAnimate() {
    const stimulus = this.entities.currentStimulus!;
    this.playerResponse = this.pendingResponse!;
    const correctAction = this.trialManager.getCategoryAction(stimulus.category);
    this.trialIsCorrect = this.playerResponse === correctAction;

    // Instantly reveal grating to its true category size and position
    stimulus.reveal();

    // Trigger player physics
    if (this.playerResponse === 'jump') {
      this.entities.player.triggerJump(this.config.settings);
    } else {
      this.entities.player.triggerSlide(this.config.settings);
    }

    this.animationStartTime = performance.now();
    this.state = GameState.ANIMATING_RESPONSE;
  }

  private spawnNextStimulus() {
    const params = this.trialManager.getNextTrial();
    const correctAction = this.trialManager.getCategoryAction(params.category);
    const sc = this.experimentConfig.stimulus;

    const stimulus = new Stimulus(
      this.config.settings.canvasWidth + 50,
      this.config.settings.canvasHeight,
      sc.gratingWidth,
      sc.gratingHeight,
      sc.jumpRevealHeight,
      params.frequency,
      params.orientation,
      params.category,
      correctAction,
      sc.contrast,
    );

    this.entities.setStimulus(stimulus);
    this.stimulusOnsetTime = performance.now();
    this.pendingResponse = null;
    this.pendingPressTime = 0;
  }

  private recordTrial() {
    const stimulus = this.entities.currentStimulus!;
    const reactionTimeMs = this.pendingPressTime > 0
      ? this.pendingPressTime - this.stimulusOnsetTime
      : performance.now() - this.stimulusOnsetTime;

    const healthBefore = this.healthBar.getCurrentHealth();
    if (this.trialIsCorrect) {
      this.healthBar.heal(this.experimentConfig.health.correctHeal);
    } else {
      this.healthBar.damage(this.experimentConfig.health.incorrectDamage);
    }

    this.trialLogger.recordTrial({
      trialNumber: this.trialManager.getCurrentTrialNumber(),
      frequency: stimulus.frequency,
      orientation: stimulus.orientation,
      correctCategory: stimulus.category,
      correctAction: stimulus.correctAction,
      playerResponse: this.playerResponse!,
      isCorrect: this.trialIsCorrect,
      reactionTimeMs,
      timestamp: Date.now(),
      phase: this.trialManager.getCurrentPhase(),
      healthBefore,
      healthAfter: this.healthBar.getCurrentHealth(),
    });
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────

  private draw() {
    this.renderer.clear();
    this.renderer.drawGround(this.config.settings.canvasHeight);

    // Player
    const p = this.entities.player;
    const playerColor = p.isStumbling ? '#ff4444' : p.color;
    this.renderer.drawRect(p.x, p.y, p.width, p.height, playerColor, p.isSliding);

    // Stimulus
    const stimulus = this.entities.currentStimulus;
    if (stimulus) {
      if (this.state === GameState.SHOWING_FEEDBACK) {
        const feedbackColor = this.trialIsCorrect
          ? this.experimentConfig.display.correctColor
          : this.experimentConfig.display.incorrectColor;

        if (this.experimentConfig.display.showFeedbackBorder) {
          this.renderer.drawGratingWithFeedback(stimulus, feedbackColor, 4);
        } else {
          this.renderer.drawGrating(stimulus);
        }

        if (this.experimentConfig.display.showFeedbackIcon) {
          this.renderer.drawFeedbackIcon(
            stimulus.x + stimulus.width / 2,
            stimulus.y - 24,
            this.trialIsCorrect,
            feedbackColor,
          );
        }
      } else {
        this.renderer.drawGrating(stimulus);
      }
    }

    // Feedback overlay (full screen flash, visible even after grating scrolls off)
    if (this.state === GameState.SHOWING_FEEDBACK) {
      const elapsed = performance.now() - this.feedbackStartTime;
      const progress = elapsed / this.experimentConfig.display.feedbackDurationMs;
      this.renderer.drawFeedbackOverlay(
        this.trialIsCorrect,
        this.experimentConfig.display.correctColor,
        this.experimentConfig.display.incorrectColor,
        progress,
      );
    }

    // HUD
    if (this.healthBar.isVisible()) {
      this.renderer.drawHealthBar(
        this.healthBar.getHealthPercent(),
        this.config.settings.canvasWidth - 160,
        10,
        150,
        20,
      );
    }

    if (this.experimentConfig.display.showTrialCounter) {
      this.renderer.drawTrialCounter(
        this.trialManager.getCurrentTrialNumber() + 1,
        this.trialManager.getTotalTrials(),
        10,
        25,
      );
    }

    if (this.state === GameState.AWAITING_RESPONSE) {
      this.renderer.drawPromptText(
        'Jump \u2191  or  Slide \u2193',
        this.config.settings.canvasWidth / 2,
        60,
      );
    }
  }
}
