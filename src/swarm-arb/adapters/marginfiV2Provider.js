import { FlashLoanProvider, MARGINFI_V2_FLASHLOAN_INSTRUCTIONS } from './interfaces.js';

export class MarginfiV2FlashLoanProvider extends FlashLoanProvider {
  name() {
    return 'marginfi-v2';
  }

  async availableLiquidity(_mint) {
    return { amount: 0n, source: this.name() };
  }

  async buildStart(request) {
    return { provider: this.name(), instruction: MARGINFI_V2_FLASHLOAN_INSTRUCTIONS[0], request };
  }

  async buildBorrow(request) {
    return { provider: this.name(), instruction: 'marginfi_v2_borrow_via_sdk', request };
  }

  async buildRepay(request) {
    return { provider: this.name(), instruction: 'marginfi_v2_repay_via_sdk', request };
  }

  async buildEnd(request) {
    return { provider: this.name(), instruction: MARGINFI_V2_FLASHLOAN_INSTRUCTIONS[1], request };
  }
}
