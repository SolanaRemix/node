import { createRuntimeConfig } from '../../packages/shared/config/runtime-config.js';
import { EventBus } from '../../packages/shared/events/event-bus.js';
import { ServiceRegistry } from '../../packages/shared/services/service-registry.js';
import { EventTopics } from '../../packages/shared/contracts/platform-contracts.js';
import { createOrchestratorService } from '../../services/orchestrator/index.js';
import { createRepairEngineService } from '../../services/repair-engine/index.js';
import { createDeploymentEngineService } from '../../services/deployment-engine/index.js';
import { createMonitoringEngineService } from '../../services/monitoring-engine/index.js';
import { createAiEngineService } from '../../services/ai-engine/index.js';
import { createLedgerEngineService } from '../../services/ledger-engine/index.js';

export function createEnterprisePlatform(options = {}) {
  const config = createRuntimeConfig(options.config || {});
  const eventBus = new EventBus();
  const registry = new ServiceRegistry();
  const ledger = createLedgerEngineService();

  registry.register(createRepairEngineService());
  registry.register(createDeploymentEngineService());
  registry.register(createMonitoringEngineService());
  registry.register(createAiEngineService({ providers: config.enabledProviders }));
  registry.register(ledger);

  const orchestrator = createOrchestratorService({ eventBus, registry, ledger });
  registry.register(orchestrator);

  return {
    config,
    eventBus,
    registry,
    async start() {
      await registry.startAll({ config });
      return registry.list();
    },
    async stop() {
      await registry.stopAll({ config });
      return true;
    },
    schedule(task) {
      eventBus.publish(EventTopics.TASK_SCHEDULED, task);
    },
    listServices() {
      return registry.list();
    },
    exportLedger() {
      return ledger.export();
    }
  };
}
