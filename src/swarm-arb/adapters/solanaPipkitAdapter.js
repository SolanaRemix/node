import { SOLANA_PIPKIT_VERSION } from './interfaces.js';

export class SolanaPipkitAdapter {
  constructor() {
    this.version = SOLANA_PIPKIT_VERSION;
  }

  getCapabilities() {
    return {
      mevProtection: true,
      jito: true,
      speed: true,
      simulation: true,
      multiAgent: true,
    };
  }
}
