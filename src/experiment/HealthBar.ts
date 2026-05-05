import { HealthConfig } from './types';

export class HealthBar {
  private health: number;
  private readonly maxHealth: number;
  private readonly floor: number;
  private readonly regenRate: number;
  private readonly regenIntervalMs: number;
  private lastRegenTime: number;
  private readonly visible: boolean;

  constructor(config: HealthConfig) {
    this.maxHealth = config.max;
    this.health = config.initial;
    this.floor = config.floor;
    this.regenRate = config.regenRate;
    this.regenIntervalMs = config.regenIntervalMs;
    this.lastRegenTime = performance.now();
    this.visible = config.visible;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  damage(amount: number) {
    this.health = Math.max(this.floor, this.health - amount);
  }

  updateRegen() {
    const now = performance.now();
    if (now - this.lastRegenTime >= this.regenIntervalMs) {
      this.heal(this.regenRate);
      this.lastRegenTime = now;
    }
  }

  getHealthPercent(): number {
    return this.health / this.maxHealth;
  }

  getCurrentHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
