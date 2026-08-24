export class OpportunityAuditLog {
  constructor() {
    this.records = [];
  }

  record(stage, opportunityId, details = {}) {
    this.records.push({
      stage,
      opportunityId,
      details,
      at: Date.now(),
    });
  }

  all() {
    return [...this.records];
  }
}
