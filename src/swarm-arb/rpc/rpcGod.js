export function rpcScore(rpc) {
  if (!rpc.healthy || rpc.quarantinedUntil && rpc.quarantinedUntil > Date.now()) {
    return Number.NEGATIVE_INFINITY;
  }

  return -(rpc.latencyMs) - (rpc.slotLag * 100) - (rpc.errorRateBps * 2);
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
      .filter((ep) => rpcScore(ep) !== Number.NEGATIVE_INFINITY)
      .sort((a, b) => rpcScore(b) - rpcScore(a));
  }

  markFailure(name, quarantineMs = 60_000) {
    const endpoint = this.endpoints.find((ep) => ep.name === name);
    if (!endpoint) return;
    endpoint.errorRateBps += 100;
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
