import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canAgentExecute, assertExecutionAuthority } from '../../src/swarm-arb/agents/registry.js';
import { ExecutionGate } from '../../src/swarm-arb/pipeline/executionGate.js';

describe('Authority controls', () => {
  it('allows only GOD-06 and GOD-09 to execute', () => {
    assert.equal(canAgentExecute('GOD-06'), true);
    assert.equal(canAgentExecute('GOD-09'), true);
    assert.equal(canAgentExecute('GOD-01'), false);

    assert.doesNotThrow(() => assertExecutionAuthority('GOD-06'));
    assert.throws(() => assertExecutionAuthority('GOD-03'));
  });
});

describe('ExecutionGate', () => {
  it('enforces pipeline stage order for successful flow', async () => {
    const gate = new ExecutionGate({
      simulator: async () => ({ ok: true }),
      riskSentinel: async () => ({ approved: true }),
      bundleBuilder: async () => ({ tx: 'bundle' }),
      submitter: async () => ({ succeeded: true, signature: 'sig-1' }),
      settler: async () => ({ reconciled: true, realizedPnlLamports: 50 }),
    });

    const result = await gate.run({ opportunity: { id: 'opp-1' }, executorAgentId: 'GOD-06', endpoint: 'rpc-1' });
    assert.equal(result.ok, true);
    assert.deepEqual(result.stageState, ['simulation', 'risk', 'bundle', 'submit', 'settlement']);
    assert.doesNotThrow(() => ExecutionGate.assertStageOrder(result.stageState));
  });

  it('stops on risk veto', async () => {
    const gate = new ExecutionGate({
      simulator: async () => ({ ok: true }),
      riskSentinel: async () => ({ approved: false, reason: 'slippage_limit' }),
      bundleBuilder: async () => ({ tx: 'bundle' }),
      submitter: async () => ({ succeeded: true }),
      settler: async () => ({ reconciled: true }),
    });

    const result = await gate.run({ opportunity: { id: 'opp-2' }, executorAgentId: 'GOD-09', endpoint: 'rpc-2' });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'slippage_limit');
    assert.deepEqual(result.stageState, ['simulation', 'risk']);
  });
});
