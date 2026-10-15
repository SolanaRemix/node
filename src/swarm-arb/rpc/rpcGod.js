export function rpcScore(rpc) {
  if (!isEndpointUsable(rpc)) {
    return Number.NEGATIVE_INFINITY;
  }

  return -(rpc.latencyMs) - (rpc.slotLag * 100) - (rpc.errorRateBps * 2);
}

export function isEndpointUsable(rpc, now = Date.now()) {
  return Boolean(rpc.healthy) && !((rpc.quarantinedUntil ?? 0) > now);
}

export class RpcGod {
  constructor(endpoints = []) {
    this.endpoints = endpoints.map((ep) => ({ ...ep, quarantinedUntil: ep.quarantinedUntil ?? 0 }));
  }

  healthiest() {
    return this.endpoints
      .slice()
      .sort((a, b) => rpcScore(b) - rpcScore(a))[0] ?? null;
  }

  raceHealthy() {
    return this.endpoints
      .map((ep) => ({ ep, score: rpcScore(ep) }))
      .filter((item) => isEndpointUsable(item.ep))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.ep);
  }

  markFailure(name, quarantineMs = 60_000) {
    const endpoint = this.endpoints.find((ep) => ep.name === name);
    if (!endpoint) return;
    endpoint.errorRateBps = Math.min(10_000, endpoint.errorRateBps + 100);
    endpoint.quarantinedUntil = Date.now() + quarantineMs;
    endpoint.healthy = false;
  }

  markHealthy(name, latencyMs, slotLag = 0) {
    const endpoint = this.endpoints.find((ep) => ep.name === name);
    if (!endpoint) return;
    endpoint.healthy = true;
    endpoint.latencyMs = latencyMs;
    endpoint.slotLag = slotLag;
    endpoint.errorRateBps = Math.max(0, endpoint.errorRateBps - 50);
    endpoint.quarantinedUntil = 0;
  }
}
