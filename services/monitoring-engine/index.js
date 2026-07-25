import os from 'node:os';
import { ServiceNames } from '../../packages/shared/contracts/platform-contracts.js';

export function createMonitoringEngineService() {
  return {
    name: ServiceNames.MONITORING,
    async start() {},
    async stop() {},
    async execute(task) {
      return {
        taskId: task.id,
        metrics: {
          cpuCount: os.cpus().length,
          freeMemory: os.freemem(),
          totalMemory: os.totalmem(),
          uptime: os.uptime()
        }
      };
    }
  };
}
