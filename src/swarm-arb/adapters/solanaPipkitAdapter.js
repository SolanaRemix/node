import { SOLANA_PIPKIT_VERSION } from './interfaces.js';

export class SolanaPipkitAdapter {
  constructor(version = SOLANA_PIPKIT_VERSION) {
    if (version !== SOLANA_PIPKIT_VERSION) {
      throw new Error(`Unsupported solana-pipkit version ${version}. Expected ${SOLANA_PIPKIT_VERSION}.`);
    }
    this.version = version;
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
