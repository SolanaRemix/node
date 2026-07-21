import { ServiceNames } from '../../packages/shared/contracts/platform-contracts.js';

export function createAiEngineService({ providers = ['openai', 'anthropic'] } = {}) {
  return {
    name: ServiceNames.AI,
    async start() {},
    async stop() {},
    async execute(task) {
      const preferred = task.payload?.provider;
      const provider = providers.includes(preferred) ? preferred : providers[0];
      return {
        taskId: task.id,
        provider,
        routed: true,
        fallbackChain: providers
      };
    }
  };
}
