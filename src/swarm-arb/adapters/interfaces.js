export const SOLANA_PIPKIT_VERSION = '2.2.0';
export const MARGINFI_V2_FLASHLOAN_INSTRUCTIONS = Object.freeze([
  'lending_account_start_flashloan',
  'lending_account_end_flashloan',
]);

export class FlashLoanProvider {
  name() {
    throw new Error('not implemented');
  }

  async availableLiquidity(_mint) {
    throw new Error('not implemented');
  }

  async buildStart(_request) {
    throw new Error('not implemented');
  }

  async buildBorrow(_request) {
    throw new Error('not implemented');
  }

  async buildRepay(_request) {
    throw new Error('not implemented');
  }

  async buildEnd(_request) {
    throw new Error('not implemented');
  }
}

export class ExecutionAdapter {
  async simulate(_txPlan) {
    throw new Error('not implemented');
  }

  async buildBundle(_txPlan) {
    throw new Error('not implemented');
  }

  async submitBundle(_bundle, _endpoint) {
    throw new Error('not implemented');
  }
}
