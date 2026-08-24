import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FailureController, ExecutionMode } from '../../src/swarm-arb/execution/failureController.js';

describe('FailureController', () => {
  it('downgrades execution mode and halts after threshold', () => {
    const fc = new FailureController({ cooldownMs: 1000, haltAfterFailures: 6 });
    fc.onFailure();
    assert.equal(fc.mode, ExecutionMode.NORMAL);
    fc.onFailure();
    assert.equal(fc.mode, ExecutionMode.CONSERVATIVE);
    fc.onFailure();
    fc.onFailure();
    assert.equal(fc.mode, ExecutionMode.RECOVERY);
    fc.onFailure();
    fc.onFailure();
    assert.equal(fc.mode, ExecutionMode.HALTED);
    assert.equal(fc.sizeMultiplier(), 0);
    assert.equal(fc.canExecute(), false);
  });

  it('resets on success', () => {
    const fc = new FailureController();
    fc.onFailure();
    fc.onFailure();
    fc.onSuccess(Date.now() + 60_000);
    assert.equal(fc.consecutiveFailures, 0);
    assert.equal(fc.mode, ExecutionMode.NORMAL);
  });

  it('does not bypass active cooldown when recovering', () => {
    const now = Date.now();
    const fc = new FailureController({ cooldownMs: 1_000, haltAfterFailures: 6 });
    fc.onFailure(now);
    fc.onFailure(now);
    fc.onFailure(now);
    fc.onFailure(now);
    assert.equal(fc.mode, ExecutionMode.RECOVERY);
    fc.onSuccess(now + 100);
    assert.equal(fc.mode, ExecutionMode.CONSERVATIVE);
  });

  it('supports explicit reset from halted mode', () => {
    const fc = new FailureController({ haltAfterFailures: 2 });
    fc.onFailure();
    fc.onFailure();
    assert.equal(fc.mode, ExecutionMode.HALTED);
    fc.reset();
    assert.equal(fc.mode, ExecutionMode.NORMAL);
    assert.equal(fc.consecutiveFailures, 0);
  });
});
