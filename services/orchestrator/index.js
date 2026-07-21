import { EventTopics, ServiceNames, validateTask } from '../../packages/shared/contracts/platform-contracts.js';

export function createOrchestratorService({ eventBus, registry, ledger }) {
  const queue = [];
  const inFlight = new Set();
  const completeTask = (taskId) => {
    const index = queue.findIndex((queuedTask) => queuedTask.id === taskId);
    if (index >= 0) queue.splice(index, 1);
    inFlight.delete(taskId);
  };

  return {
    name: ServiceNames.ORCHESTRATOR,
    status: 'idle',
    async start() {
      eventBus.subscribe(EventTopics.TASK_SCHEDULED, async (task) => {
        validateTask(task);
        queue.push(task);
        inFlight.add(task.id);
        const target = registry.get(task.type);
        if (!target || typeof target.execute !== 'function') {
          completeTask(task.id);
          const error = new Error(`unknown task target: ${task.type}`);
          eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
          return;
        }
        try {
          const result = await target.execute(task);
          completeTask(task.id);
          ledger.record('task_completed', { taskId: task.id, target: task.type });
          eventBus.publish(EventTopics.TASK_COMPLETED, { task, result });
        } catch (error) {
          completeTask(task.id);
          ledger.record('task_failed', { taskId: task.id, target: task.type, error: error.message });
          eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
        }
      });
    },
    async stop() {
      while (inFlight.size > 0) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      queue.length = 0;
    },
    getQueueDepth() {
      return queue.length;
    }
  };
}
