import crypto from 'node:crypto';
import { hasPermission } from '../auth/rbac.js';

export class PolicyEngine {
  constructor({ apiKeys = [], keySalt = process.env.ATOMIC_API_KEY_SALT } = {}) {
    if (apiKeys.length > 0 && !keySalt) {
      throw new Error('ATOMIC_API_KEY_SALT must be set when API keys are configured');
    }
    this.keySalt = keySalt || 'atomic-enterprise-v2';
    this.apiKeys = new Set(apiKeys.map((apiKey) => this.#hash(apiKey)));
  }

  authenticateApiKey(key) {
    if (!key) return false;
    return this.apiKeys.has(this.#hash(key));
  }

  authorize(role, permission) {
    return hasPermission(role, permission);
  }

  #hash(value) {
    return crypto.scryptSync(String(value), this.keySalt, 64).toString('hex');
  }
}
