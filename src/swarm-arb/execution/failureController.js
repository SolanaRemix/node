export const ExecutionMode = Object.freeze({
  AGGRESSIVE: 'Aggressive',
  NORMAL: 'Normal',
  CONSERVATIVE: 'Conservative',
  RECOVERY: 'Recovery',
  HALTED: 'Halted',
});

const MODE_MULTIPLIER = Object.freeze({
  [ExecutionMode.AGGRESSIVE]: 1.0,
  [ExecutionMode.NORMAL]: 0.75,
  [ExecutionMode.CONSERVATIVE]: 0.4,
  [ExecutionMode.RECOVERY]: 0.15,
  [ExecutionMode.HALTED]: 0.0,
});

export class FailureController {
  constructor({ cooldownMs = 30_000, haltAfterFailures = 6 } = {}) {
    this.consecutiveFailures = 0;
    this.mode = ExecutionMode.NORMAL;
    this.cooldownMs = cooldownMs;
    this.haltAfterFailures = haltAfterFailures;
    this.cooldownUntil = 0;
    this.circuitOpen = false;
  }

  onFailure(now = Date.now()) {
    this.consecutiveFailures += 1;

    if (this.consecutiveFailures >= this.haltAfterFailures) {
      this.mode = ExecutionMode.HALTED;
      this.circuitOpen = true;
      this.cooldownUntil = now + this.cooldownMs;
      return;
    }

    this.mode = this.#modeForFailures(this.consecutiveFailures);
    if (this.mode === ExecutionMode.RECOVERY) {
      this.cooldownUntil = Math.max(this.cooldownUntil, now + this.cooldownMs);
    }
  }

  onSuccess() {
    this.consecutiveFailures = 0;
    this.mode = ExecutionMode.NORMAL;
    this.circuitOpen = false;
    this.cooldownUntil = 0;
  }

  sizeMultiplier() {
    return MODE_MULTIPLIER[this.mode];
  }

  priorityFeeMultiplier() {
    return this.sizeMultiplier();
  }

  jitoTipMultiplier() {
    return this.sizeMultiplier();
  }

  maxConcurrency() {
    switch (this.mode) {
      case ExecutionMode.AGGRESSIVE:
      case ExecutionMode.NORMAL:
        return 4;
      case ExecutionMode.CONSERVATIVE:
        return 2;
      case ExecutionMode.RECOVERY:
        return 1;
      case ExecutionMode.HALTED:
      default:
        return 0;
    }
  }

  requiredConfirmations() {
    switch (this.mode) {
      case ExecutionMode.AGGRESSIVE:
      case ExecutionMode.NORMAL:
        return 1;
      case ExecutionMode.CONSERVATIVE:
        return 2;
      case ExecutionMode.RECOVERY:
        return 3;
      case ExecutionMode.HALTED:
      default:
        return Number.MAX_SAFE_INTEGER;
    }
  }

  canExecute(now = Date.now()) {
    if (this.mode === ExecutionMode.HALTED) {
      if (now >= this.cooldownUntil) {
        return false;
      }
      return false;
    }

    return now >= this.cooldownUntil;
  }

  #modeForFailures(failures) {
    if (failures <= 1) return ExecutionMode.NORMAL;
    if (failures <= 3) return ExecutionMode.CONSERVATIVE;
    if (failures <= 5) return ExecutionMode.RECOVERY;
    return ExecutionMode.HALTED;
  }
}
