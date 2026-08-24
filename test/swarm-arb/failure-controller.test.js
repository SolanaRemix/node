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
    fc.onSuccess();
    assert.equal(fc.consecutiveFailures, 0);
    assert.equal(fc.mode, ExecutionMode.NORMAL);
  });
});
