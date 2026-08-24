export const SWARM_MESSAGE_TYPES = Object.freeze({
  MARKET_UPDATE: 'MarketUpdate',
  OPPORTUNITY: 'Opportunity',
  ROUTE: 'Route',
  SIMULATION: 'Simulation',
  APPROVAL: 'Approval',
  EXECUTION: 'Execution',
  FAILURE: 'Failure',
  SETTLEMENT: 'Settlement',
});

export function createSwarmMessage(type, payload) {
  if (!Object.values(SWARM_MESSAGE_TYPES).includes(type)) {
    throw new Error(`Unsupported message type: ${type}`);
  }

  return {
    type,
    payload,
    emittedAt: Date.now(),
  };
}
