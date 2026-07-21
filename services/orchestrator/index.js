import { EventTopics, ServiceNames, validateTask } from '../../packages/shared/contracts/platform-contracts.js';

export function createOrchestratorService({ eventBus, registry, ledger }) {
  const queue = [];

  return {
    name: ServiceNames.ORCHESTRATOR,
    status: 'idle',
    async start() {
      eventBus.subscribe(EventTopics.TASK_SCHEDULED, async (task) => {
        validateTask(task);
        queue.push(task);
        const target = registry.get(task.type);
        if (!target || typeof target.execute !== 'function') {
          const error = new Error(`unknown task target: ${task.type}`);
          eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
          return;
        }
        try {
          const result = await target.execute(task);
          ledger.record('task_completed', { taskId: task.id, target: task.type });
          eventBus.publish(EventTopics.TASK_COMPLETED, { task, result });
        } catch (error) {
          ledger.record('task_failed', { taskId: task.id, target: task.type, error: error.message });
          eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
        }
      });
    },
    async stop() {
      queue.length = 0;
    },
    getQueueDepth() {
      return queue.length;
    }
  };
}
