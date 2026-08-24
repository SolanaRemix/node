import { randomUUID } from 'node:crypto';

export const MAX_SLOT_AGE = 8;

export function createOpportunity(input) {
  return {
    id: input.id ?? randomUUID(),
    inputMint: input.inputMint,
    outputMint: input.outputMint,
    buyVenue: input.buyVenue,
    sellVenue: input.sellVenue,
    amountIn: input.amountIn,
    expectedAmountOut: input.expectedAmountOut,
    grossProfitLamports: input.grossProfitLamports,
    dexFees: input.dexFees,
    estimatedSlippage: input.estimatedSlippage,
    networkCost: input.networkCost,
    jitoTip: input.jitoTip,
    failureReserve: input.failureReserve,
    expectedNetProfit: input.expectedNetProfit,
    sourceSlot: input.sourceSlot,
    detectedAtNs: input.detectedAtNs,
    confidenceBps: input.confidenceBps,
  };
}

export function isOpportunityFresh(opportunity, currentSlot, maxSlotAge = MAX_SLOT_AGE) {
  return opportunity.sourceSlot + maxSlotAge >= currentSlot;
}

export function shouldAcceptOpportunity(opportunity, currentSlot, minimumConfidenceBps, maxSlotAge = MAX_SLOT_AGE) {
  if (opportunity.expectedNetProfit <= 0) return false;
  if (opportunity.confidenceBps < minimumConfidenceBps) return false;
  return isOpportunityFresh(opportunity, currentSlot, maxSlotAge);
}

export function createRoutePlan(opportunityId, hops, expectedNetProfit) {
  return {
    opportunityId,
    hops,
    expectedNetProfit,
    createdAt: Date.now(),
  };
}

export function createSimulationResult(opportunityId, ok, reason = 'ok') {
  return {
    opportunityId,
    ok,
    reason,
    simulatedAt: Date.now(),
  };
}

export function createExecutionApproval(opportunityId, approved, reason) {
  return {
    opportunityId,
    approved,
    reason,
    decidedAt: Date.now(),
  };
}

export function createExecutionResult(opportunityId, succeeded, signature = null, endpoint = null) {
  return {
    opportunityId,
    succeeded,
    signature,
    endpoint,
    executedAt: Date.now(),
  };
}

export function createSettlement(opportunityId, realizedPnlLamports, reconciled) {
  return {
    opportunityId,
    realizedPnlLamports,
    reconciled,
    settledAt: Date.now(),
  };
}
