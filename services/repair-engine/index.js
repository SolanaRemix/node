import { ServiceNames } from '../../packages/shared/contracts/platform-contracts.js';

export function createRepairEngineService() {
  return {
    name: ServiceNames.REPAIR,
    async start() {},
    async stop() {},
    async execute(task) {
      const findings = [];
      if (task.payload?.repoUrl && !task.payload.repoUrl.startsWith('https://github.com/')) {
        findings.push('non-github-repo-url');
      }
      return {
        taskId: task.id,
        mode: 'incremental',
        findings,
        actions: ['analyze', 'validate', 'propose_patch']
      };
    }
  };
}
