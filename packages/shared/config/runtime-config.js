export const DEFAULT_RUNTIME_CONFIG = Object.freeze({
  version: '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  queueConcurrency: Number(process.env.ATOMIC_QUEUE_CONCURRENCY || 4),
  healthPollMs: Number(process.env.ATOMIC_HEALTH_POLL_MS || 30000),
  policyDefaultRole: process.env.ATOMIC_DEFAULT_ROLE || 'viewer',
  apiRateLimitPerMinute: Number(process.env.ATOMIC_API_RATE_LIMIT || 120),
  enabledProviders: (process.env.ATOMIC_AI_PROVIDERS || 'openai,anthropic,gemini,ollama').split(',').map((provider) => provider.trim()).filter(Boolean)
});

export function createRuntimeConfig(overrides = {}) {
  return {
    ...DEFAULT_RUNTIME_CONFIG,
    ...overrides,
    enabledProviders: Array.isArray(overrides.enabledProviders)
      ? [...new Set(overrides.enabledProviders)]
      : DEFAULT_RUNTIME_CONFIG.enabledProviders
  };
}
