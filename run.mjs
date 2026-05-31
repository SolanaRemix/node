#!/usr/bin/env node

/**
 * Elite Test Script - Atomic Swarm Gods v1.7.0
 * Validates the auto-repair system with all elite features
 */

import { AtomicRepair } from './dist/index.js';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║  ⚡ ATOMIC SWARM GODS ELITE v1.7.0 - TEST SUITE             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Configuration with all elite features
const config = {
  nodeVersion: process.version,
  wasmSupport: true,
  strictMode: true,
  
  // Elite Enterprise features
  eliteMode: true,
  dynamicShifting: true,
  auditConfidence: 0.9997,
  blockchainAudit: true,
  maxRepairAttempts: 3,
  shiftStrategy: 'adaptive',
  enableWebhooks: true
};

console.log('📊 Configuration:');
console.log(`  • Node Version: ${config.nodeVersion}`);
console.log(`  • Elite Mode: ${config.eliteMode}`);
console.log(`  • Dynamic Shifting: ${config.dynamicShifting}`);
console.log(`  • Blockchain Audit: ${config.blockchainAudit}`);
console.log(`  • Confidence: ${(config.auditConfidence * 100).toFixed(2)}%`);
console.log('');

// Check if dist exists
import { existsSync } from 'fs';
if (!existsSync('./dist/index.js')) {
  console.error('❌ dist/index.js not found. Run `npm run build` first.');
  process.exit(1);
}

try {
  const repair = new AtomicRepair(config);
  
  // Listen for events (if EventEmitter is supported)
  if (typeof repair.on === 'function') {
    repair.on('repair_complete', (data) => {
      console.log(`\n📢 Event: Repair completed with success=${data.success}`);
    });
  }
  
  console.log('🔧 Running elite auto-repair...\n');
  const startTime = Date.now();
  const success = await repair.repair();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  ${success ? '✅' : '⚠️'} TEST COMPLETE - ${duration}s                                    ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Results:');
  console.log(`  • Status: ${success ? 'SUCCESS' : 'PARTIAL'}`);
  console.log(`  • Repair Attempts: ${repair.getRepairAttempts()}`);
  console.log(`  • Audits Performed: ${repair.getAuditHistory().length}`);
  console.log(`  • Dynamic Shifts: ${repair.getShiftMetrics().length}`);
  console.log(`  • Average Confidence: ${(repair.getAverageConfidence() * 100).toFixed(2)}%`);
  
  // Verify blockchain if method exists
  if (typeof repair.verifyBlockchain === 'function') {
    console.log(`  • Blockchain Verified: ${repair.verifyBlockchain() ? '✅' : '❌'}`);
  }
  console.log('');
  
  process.exit(success ? 0 : 1);
  
} catch (error) {
  console.error('\n❌ TEST FAILED:', error.message);
  console.error(error.stack);
  process.exit(1);
}