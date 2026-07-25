const VALID_PERMISSION = new Set(['read:repo', 'write:repo', 'read:ledger', 'write:ledger', 'dispatch:tasks']);

export function validatePluginManifest(manifest) {
  if (!manifest?.name || !manifest?.version || !manifest?.main) {
    throw new Error('plugin manifest requires name/version/main');
  }
  const permissions = manifest.permissions || [];
  for (const permission of permissions) {
    if (!VALID_PERMISSION.has(permission)) {
      throw new Error(`invalid plugin permission: ${permission}`);
    }
  }
  return {
    ...manifest,
    permissions,
    enabled: manifest.enabled !== false
  };
}
