import { assertExecutionAuthority } from '../agents/registry.js';

const STAGES = Object.freeze([
  'simulation',
  'risk',
  'bundle',
  'submit',
  'settlement',
]);

export class ExecutionGate {
  constructor({ simulator, riskSentinel, bundleBuilder, submitter, settler }) {
    this.simulator = simulator;
    this.riskSentinel = riskSentinel;
    this.bundleBuilder = bundleBuilder;
    this.submitter = submitter;
    this.settler = settler;
  }

  async run({ opportunity, executorAgentId, endpoint }) {
    assertExecutionAuthority(executorAgentId);

    const stageState = [];

    const simulation = await this.simulator(opportunity);
    stageState.push('simulation');
    if (!simulation.ok) {
      return { ok: false, stageState, reason: simulation.reason };
    }

    const approval = await this.riskSentinel(opportunity, simulation);
    stageState.push('risk');
    if (!approval.approved) {
      return { ok: false, stageState, reason: approval.reason ?? 'risk_veto' };
    }

    const bundle = await this.bundleBuilder(opportunity, simulation, approval);
    stageState.push('bundle');

    const execution = await this.submitter(bundle, endpoint, executorAgentId);
    stageState.push('submit');
    if (!execution.succeeded) {
      return { ok: false, stageState, reason: execution.reason ?? 'submission_failed', execution };
    }

    const settlement = await this.settler(opportunity, execution);
    stageState.push('settlement');

    return {
      ok: true,
      stageState,
      execution,
      settlement,
    };
  }

  static assertStageOrder(stageState) {
    for (let i = 0; i < stageState.length; i += 1) {
      if (stageState[i] !== STAGES[i]) {
        throw new Error(`Invalid pipeline order at index ${i}: expected ${STAGES[i]} but got ${stageState[i]}`);
      }
    }
  }
}
