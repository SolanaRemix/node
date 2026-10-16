const ROLE_PERMISSIONS = {
  admin: ['*'],
  operator: ['dispatch:tasks', 'read:repo', 'write:repo', 'read:ledger', 'write:ledger'],
  viewer: ['read:repo', 'read:ledger']
};

export function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  return permissions.includes('*') || permissions.includes(permission);
}
