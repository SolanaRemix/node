export class SwarmMetrics {
  constructor() {
    this.counters = new Map();
    this.timings = [];
  }

  increment(name, delta = 1) {
    this.counters.set(name, (this.counters.get(name) ?? 0) + delta);
  }

  observeTiming(name, ms) {
    this.timings.push({ name, ms, at: Date.now() });
  }

  snapshot() {
    return {
      counters: Object.fromEntries(this.counters.entries()),
      timings: [...this.timings],
    };
  }
}
