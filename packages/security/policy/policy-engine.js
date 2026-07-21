import crypto from 'node:crypto';
import { hasPermission } from '../auth/rbac.js';

export class PolicyEngine {
  constructor({ apiKeys = [] } = {}) {
    this.apiKeys = new Set(apiKeys.map((k) => this.#hash(k)));
  }

  authenticateApiKey(key) {
    if (!key) return false;
    return this.apiKeys.has(this.#hash(key));
  }

  authorize(role, permission) {
    return hasPermission(role, permission);
  }

  #hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }
}
