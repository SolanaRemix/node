import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SwarmCommander } from '../../src/swarm-arb/runtime/swarmCommander.js';
import { SwarmBus } from '../../src/swarm-arb/bus/swarmBus.js';
import { OpportunityAuditLog } from '../../src/swarm-arb/observability/audit.js';
import { createOpportunity } from '../../src/swarm-arb/domain/models.js';
import { SWARM_MESSAGE_TYPES } from '../../src/swarm-arb/bus/messages.js';

describe('SwarmCommander and Bus', () => {
  it('publishes accepted opportunities and rejects invalid opportunities', async () => {
    const bus = new SwarmBus();
    const audit = new OpportunityAuditLog();
    const commander = new SwarmCommander({
      config: { minimumConfidenceBps: 7000, maxSlotAge: 8 },
      bus,
      audit,
    });

    let received = null;
    bus.subscribe(SWARM_MESSAGE_TYPES.OPPORTUNITY, (msg) => {
      received = msg.payload;
    });

    const acceptedOpp = createOpportunity({
      inputMint: 'A',
      outputMint: 'B',
      buyVenue: 'raydium',
      sellVenue: 'orca',
      amountIn: 100,
      expectedAmountOut: 120,
      grossProfitLamports: 30,
      dexFees: 5,
      estimatedSlippage: 2,
      networkCost: 3,
      jitoTip: 4,
      failureReserve: 1,
      expectedNetProfit: 15,
      sourceSlot: 100,
      detectedAtNs: 1,
      confidenceBps: 8000,
    });

    const accepted = commander.ingestOpportunity(acceptedOpp, 105);
    assert.equal(accepted, true);
    assert.equal(received.id, acceptedOpp.id);

    const rejectedOpp = createOpportunity({ ...acceptedOpp, id: 'rejected', expectedNetProfit: -1 });
    const rejected = commander.ingestOpportunity(rejectedOpp, 105);
    assert.equal(rejected, false);

    const stages = audit.all().map((r) => r.stage);
    assert.ok(stages.includes('opportunity_accepted'));
    assert.ok(stages.includes('opportunity_rejected'));
  });
});
