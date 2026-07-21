export const v1ServerApiSurface = Object.freeze({
  health: '/health',
  metrics: '/metrics',
  blockchain: '/api/blockchain',
  surgeryRecords: '/api/surgery/records',
  surgeryStart: '/api/surgery/start',
  surgeryClone: '/api/surgery/clone',
  surgeryRepair: '/api/surgery/elite-repair',
  surgeryCommit: '/api/surgery/commit',
  surgeryCreatePr: '/api/surgery/create-pr',
  surgeryAutofix: '/api/surgery/autofix'
});

export function mapLegacyTaskToV2(message) {
  return {
    id: `legacy-${Date.now()}`,
    type: message.type || 'repair-engine',
    payload: message.payload || {}
  };
}
