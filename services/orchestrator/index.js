import { EventTopics, ServiceNames, validateTask } from '../../packages/shared/contracts/platform-contracts.js';

export function createOrchestratorService({ eventBus, registry, ledger }) {
  const queue = [];
  const inFlight = new Map();
  const dequeueTask = (taskId) => {
    const index = queue.findIndex((queuedTask) => queuedTask.id === taskId);
    if (index >= 0) queue.splice(index, 1);
  };
  const completeTask = (taskId) => {
    inFlight.delete(taskId);
  };

  let unsubscribeTaskScheduled = null;

  return {
    name: ServiceNames.ORCHESTRATOR,
    status: 'idle',
    async start() {
      unsubscribeTaskScheduled = eventBus.subscribe(EventTopics.TASK_SCHEDULED, async (task) => {
        try {
          validateTask(task);
        } catch (error) {
          eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
          return;
        }
        queue.push(task);
        const executionPromise = (async () => {
          const target = registry.get(task.type);
          if (!target || typeof target.execute !== 'function') {
            dequeueTask(task.id);
            completeTask(task.id);
            const error = new Error(`unknown task target: ${task.type}`);
            eventBus.publish(EventTopics.TASK_FAILED, { task, error: error.message });
            return;
          }
          dequeueTask(task.id);
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
        })();
        inFlight.set(task.id, executionPromise);
        await executionPromise;
      });
    },
    async stop() {
      if (unsubscribeTaskScheduled) {
        unsubscribeTaskScheduled();
        unsubscribeTaskScheduled = null;
      }
      await Promise.allSettled([...inFlight.values()]);
      queue.length = 0;
    },
    getQueueDepth() {
      return queue.length;
    }
  };
}
