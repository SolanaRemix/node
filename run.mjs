import { AtomicRepair } from './dist/index.js';

const config = {
  nodeVersion: process.version,
  wasmSupport: true,
  strictMode: true
};

const repair = new AtomicRepair(config);
await repair.repair();
