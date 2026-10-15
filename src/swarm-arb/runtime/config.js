function readRequiredSecret(name, env) {
  const value = env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required secret: ${name}`);
  }
  return value;
}

export function loadSwarmConfig(env = process.env) {
  return {
    minimumConfidenceBps: Number(env.SWARM_ARB_MIN_CONFIDENCE_BPS ?? 7000),
    maxSlotAge: Number(env.SWARM_ARB_MAX_SLOT_AGE ?? 8),
    cooldownMs: Number(env.SWARM_ARB_COOLDOWN_MS ?? 30_000),
    haltAfterFailures: Number(env.SWARM_ARB_HALT_AFTER_FAILURES ?? 6),
    jitoTipCapLamports: Number(env.SWARM_ARB_JITO_TIP_CAP_LAMPORTS ?? 1_000_000),
    secrets: {
      walletAuthority: readRequiredSecret('SWARM_ARB_WALLET_AUTHORITY', env),
      jitoAuth: readRequiredSecret('SWARM_ARB_JITO_AUTH', env),
    },
  };
}

export function redactSecrets(config) {
  return {
    ...config,
    secrets: Object.fromEntries(
      Object.keys(config.secrets).map((k) => [k, '[REDACTED]']),
    ),
  };
}
