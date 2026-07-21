import { ServiceNames } from '../../packages/shared/contracts/platform-contracts.js';

export function createRepairEngineService() {
  const isValidGitHubRepoUrl = (value) => {
    if (typeof value !== 'string') return false;
    try {
      const parsed = new URL(value);
      const segments = parsed.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
      const [owner, repo] = segments;
      const ownerPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37})$/;
      const repoPattern = /^[A-Za-z0-9._-]+$/;
      return parsed.protocol === 'https:' &&
        parsed.hostname === 'github.com' &&
        segments.length >= 2 &&
        ownerPattern.test(owner) &&
        repoPattern.test(repo.replace(/\\.git$/i, ''));
    } catch {
      return false;
    }
  };

  return {
    name: ServiceNames.REPAIR,
    async start() {},
    async stop() {},
    async execute(task) {
      const findings = [];
      if (task.payload?.repoUrl && !isValidGitHubRepoUrl(task.payload.repoUrl)) {
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
