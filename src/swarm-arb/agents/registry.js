export const AGENTS = Object.freeze({
  GOD_01: { id: 'GOD-01', name: 'Raydium pool scanner', canExecute: false },
  GOD_02: { id: 'GOD-02', name: 'Orca pool scanner', canExecute: false },
  GOD_03: { id: 'GOD-03', name: 'Meteora pool scanner', canExecute: false },
  GOD_04: { id: 'GOD-04', name: 'Jupiter route optimizer', canExecute: false },
  GOD_05: { id: 'GOD-05', name: 'Marginfi flash-loan composer', canExecute: false },
  GOD_06: { id: 'GOD-06', name: 'Jito bundle builder', canExecute: true },
  GOD_07: { id: 'GOD-07', name: 'Transaction simulator', canExecute: false },
  GOD_08: { id: 'GOD-08', name: 'Risk/Safety sentinel', canExecute: false, vetoOnly: true },
  GOD_09: { id: 'GOD-09', name: 'RPC/endpoint race', canExecute: true },
  GOD_10: { id: 'GOD-10', name: 'Settlement/PnL/reconciliation', canExecute: false },
});

const EXECUTOR_IDS = new Set(['GOD-06', 'GOD-09']);

export function canAgentExecute(agentId) {
  return EXECUTOR_IDS.has(agentId);
}

export function assertExecutionAuthority(agentId) {
  if (!canAgentExecute(agentId)) {
    throw new Error(`Execution denied for ${agentId}. Only GOD-06 and GOD-09 can execute.`);
  }
}
