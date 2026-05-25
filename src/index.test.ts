import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AtomicRepair } from './index.js';

describe('AtomicRepair', () => {
  it('should initialize with config', () => {
    const repair = new AtomicRepair({
      nodeVersion: '20.0.0',
      wasmSupport: true,
      strictMode: true
    });
    assert.ok(repair);
  });

  it('should run repair successfully', async () => {
    const repair = new AtomicRepair({
      nodeVersion: '20.0.0',
      wasmSupport: false,
      strictMode: false
    });
    const result = await repair.repair();
    assert.strictEqual(result, true);
  });
});
