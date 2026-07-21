import crypto from 'node:crypto';
import { ServiceNames } from '../../packages/shared/contracts/platform-contracts.js';

export function createLedgerEngineService() {
  const chain = [
    {
      index: 0,
      timestamp: new Date().toISOString(),
      previousHash: '0'.repeat(64),
      event: 'genesis',
      payload: { version: '2.0.0' },
      hash: crypto.createHash('sha256').update('genesis').digest('hex')
    }
  ];

  return {
    name: ServiceNames.LEDGER,
    async start() {},
    async stop() {},
    record(event, payload = {}) {
      const previous = chain[chain.length - 1];
      const block = {
        index: chain.length,
        timestamp: new Date().toISOString(),
        previousHash: previous.hash,
        event,
        payload
      };
      const hash = crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
      const finalBlock = { ...block, hash };
      chain.push(finalBlock);
      return finalBlock;
    },
    verify() {
      for (let index = 1; index < chain.length; index++) {
        if (chain[index].previousHash !== chain[index - 1].hash) return false;
      }
      return true;
    },
    export() {
      return [...chain];
    },
    async execute(task) {
      return this.record('task_ledger_record', { taskId: task.id, payload: task.payload || {} });
    }
  };
}
