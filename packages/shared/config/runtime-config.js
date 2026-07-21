function parseProviderList(envValue) {
  return String(envValue || '')
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean);
}

function parseIntEnv(envValue, fallback) {
  const parsed = Number(envValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const DEFAULT_RUNTIME_CONFIG = Object.freeze({
  version: '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  queueConcurrency: parseIntEnv(process.env.ATOMIC_QUEUE_CONCURRENCY, 4),
  healthPollMs: parseIntEnv(process.env.ATOMIC_HEALTH_POLL_MS, 30000),
  policyDefaultRole: process.env.ATOMIC_DEFAULT_ROLE || 'viewer',
  apiRateLimitPerMinute: parseIntEnv(process.env.ATOMIC_API_RATE_LIMIT, 120),
  enabledProviders: parseProviderList(process.env.ATOMIC_AI_PROVIDERS || 'openai,anthropic,gemini,ollama')
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
