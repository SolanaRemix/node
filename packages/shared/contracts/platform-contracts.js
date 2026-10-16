export const ServiceNames = Object.freeze({
  ORCHESTRATOR: 'orchestrator',
  REPAIR: 'repair-engine',
  DEPLOYMENT: 'deployment-engine',
  MONITORING: 'monitoring-engine',
  AI: 'ai-engine',
  LEDGER: 'ledger-engine'
});

export const EventTopics = Object.freeze({
  TASK_SCHEDULED: 'task.scheduled',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  REPAIR_REQUESTED: 'repair.requested',
  DEPLOYMENT_REQUESTED: 'deployment.requested',
  HEALTH_REPORTED: 'health.reported',
  LEDGER_RECORDED: 'ledger.recorded'
});

export function validateTask(task) {
  if (!task || typeof task !== 'object') {
    throw new TypeError('task must be an object');
  }
  if (!task.id || typeof task.id !== 'string') {
    throw new TypeError('task.id must be a non-empty string');
  }
  if (!task.type || typeof task.type !== 'string') {
    throw new TypeError('task.type must be a non-empty string');
  }
  return true;
}
