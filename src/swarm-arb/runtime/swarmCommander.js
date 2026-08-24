import { shouldAcceptOpportunity } from '../domain/models.js';
import { createSwarmMessage, SWARM_MESSAGE_TYPES } from '../bus/messages.js';

export class SwarmCommander {
  constructor({ config, bus, audit }) {
    this.config = config;
    this.bus = bus;
    this.audit = audit;
  }

  ingestOpportunity(opportunity, currentSlot) {
    const accepted = shouldAcceptOpportunity(
      opportunity,
      currentSlot,
      this.config.minimumConfidenceBps,
      this.config.maxSlotAge,
    );

    if (!accepted) {
      this.audit.record('opportunity_rejected', opportunity.id, {
        expectedNetProfit: opportunity.expectedNetProfit,
        confidenceBps: opportunity.confidenceBps,
        sourceSlot: opportunity.sourceSlot,
        currentSlot,
      });
      return false;
    }

    this.bus.publish(createSwarmMessage(SWARM_MESSAGE_TYPES.OPPORTUNITY, opportunity));
    this.audit.record('opportunity_accepted', opportunity.id, { currentSlot });
    return true;
  }
}
