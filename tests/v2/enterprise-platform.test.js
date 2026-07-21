import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnterprisePlatform } from '../../apps/api/index.js';

test('enterprise platform starts and registers core services', async () => {
  const platform = createEnterprisePlatform({ config: { enabledProviders: ['openai', 'anthropic'] } });
  const services = await platform.start();

  const names = services.map((service) => service.name).sort();
  assert.deepEqual(names, ['ai-engine', 'deployment-engine', 'ledger-engine', 'monitoring-engine', 'orchestrator', 'repair-engine']);

  await platform.stop();
});

test('orchestrator schedules and completes repair task', async () => {
  const platform = createEnterprisePlatform();
  await platform.start();

  const done = new Promise((resolve) => {
    platform.eventBus.once('task.completed', (result) => resolve(result));
  });

  platform.schedule({
    id: 'task-1',
    type: 'repair-engine',
    payload: { repoUrl: 'https://github.com/SolanaRemix/node' }
  });

  const result = await done;
  assert.equal(result.task.id, 'task-1');
  assert.equal(result.result.mode, 'incremental');

  await platform.stop();
});

test('ledger exports verifiable chain after task execution', async () => {
  const platform = createEnterprisePlatform();
  await platform.start();

  const done = new Promise((resolve) => {
    platform.eventBus.once('task.completed', () => resolve());
  });

  platform.schedule({ id: 'task-2', type: 'monitoring-engine', payload: {} });
  await done;

  const blocks = platform.exportLedger();
  assert.ok(blocks.length >= 2);

  await platform.stop();
});
