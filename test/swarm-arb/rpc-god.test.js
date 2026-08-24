import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RpcGod, rpcScore } from '../../src/swarm-arb/rpc/rpcGod.js';

describe('RpcGod', () => {
  it('scores and selects healthiest endpoint', () => {
    const endpoints = [
      { name: 'rpc-a', url: 'https://a', latencyMs: 80, slotLag: 1, errorRateBps: 30, healthy: true },
      { name: 'rpc-b', url: 'https://b', latencyMs: 40, slotLag: 0, errorRateBps: 10, healthy: true },
      { name: 'rpc-c', url: 'https://c', latencyMs: 20, slotLag: 5, errorRateBps: 0, healthy: true },
    ];

    const god = new RpcGod(endpoints);
    assert.equal(god.healthiest().name, 'rpc-b');
    assert.ok(rpcScore(endpoints[1]) > rpcScore(endpoints[0]));
  });

  it('quarantines failed endpoints and races healthy set', () => {
    const god = new RpcGod([
      { name: 'rpc-a', url: 'https://a', latencyMs: 20, slotLag: 0, errorRateBps: 0, healthy: true },
      { name: 'rpc-b', url: 'https://b', latencyMs: 30, slotLag: 0, errorRateBps: 0, healthy: true },
    ]);

    god.markFailure('rpc-a', 60_000);
    const raced = god.raceHealthy();
    assert.equal(raced.length, 1);
    assert.equal(raced[0].name, 'rpc-b');
  });
});
