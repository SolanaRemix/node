import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createEnterprisePlatform } from '../../apps/api/index.js';
import { PluginLoader } from '../../packages/plugins/sdk/plugin-loader.js';
import { validatePluginManifest } from '../../packages/plugins/sdk/plugin-manifest.js';

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
  assert.equal(platform.verifyLedger(), true);
  for (let index = 1; index < blocks.length; index++) {
    assert.equal(blocks[index].previousHash, blocks[index - 1].hash);
  }

  await platform.stop();
});

test('plugin-loader rejects path traversal outside allowed roots', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-root-'));
  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-outside-'));
  const outsideFile = path.join(outsideDir, 'plugin.js');
  fs.writeFileSync(outsideFile, 'export default {};');

  const loader = new PluginLoader({ allowedRoots: [tmpDir] });
  const manifest = { name: 'test-plugin', version: '1.0.0', main: 'index.js' };
  loader.register(manifest);

  // Construct a traversal path that starts inside tmpDir but resolves outside
  const traversalPath = path.join(
    tmpDir, '..', path.relative(os.tmpdir(), outsideDir), 'plugin.js'
  );
  await assert.rejects(
    () => loader.load('test-plugin', traversalPath),
    /plugin path is not in allowed roots/
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.rmSync(outsideDir, { recursive: true, force: true });
});

test('plugin-loader rejects path with .. traversal sequence', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-root-'));
  const loader = new PluginLoader({ allowedRoots: [tmpDir] });
  const manifest = { name: 'escape-plugin', version: '1.0.0', main: 'index.js' };
  loader.register(manifest);

  const escapePath = path.join(tmpDir, 'subdir', '..', '..', 'etc', 'passwd');
  await assert.rejects(
    () => loader.load('escape-plugin', escapePath),
    /plugin path is not in allowed roots|no such file or directory/i
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('plugin-loader allows path inside allowed root', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-root-'));
  const pluginFile = path.join(tmpDir, 'my-plugin.js');
  fs.writeFileSync(pluginFile, 'export default { name: "my-plugin" };');

  const loader = new PluginLoader({ allowedRoots: [tmpDir] });
  const manifest = { name: 'my-plugin', version: '1.0.0', main: 'my-plugin.js' };
  loader.register(manifest);

  const mod = await loader.load('my-plugin', pluginFile);
  assert.deepEqual(mod, { name: 'my-plugin' });

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('plugin-loader rejects symlink pointing outside allowed root', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-root-'));
  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-outside-'));
  const outsideFile = path.join(outsideDir, 'secret.js');
  fs.writeFileSync(outsideFile, 'export default {};');
  const symlinkPath = path.join(tmpDir, 'symlinked.js');
  fs.symlinkSync(outsideFile, symlinkPath);

  const loader = new PluginLoader({ allowedRoots: [tmpDir] });
  const manifest = { name: 'symlink-plugin', version: '1.0.0', main: 'symlinked.js' };
  loader.register(manifest);

  await assert.rejects(
    () => loader.load('symlink-plugin', symlinkPath),
    /plugin path is not in allowed roots/
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.rmSync(outsideDir, { recursive: true, force: true });
});
