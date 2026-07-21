import crypto from 'node:crypto';
import { hasPermission } from '../auth/rbac.js';

export class PolicyEngine {
  constructor({ apiKeys = [], keySalt = process.env.ATOMIC_API_KEY_SALT || 'atomic-enterprise-v2' } = {}) {
    this.keySalt = keySalt;
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
