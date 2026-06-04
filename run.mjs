#!/usr/bin/env node

/**
 * Elite Test Script - Atomic Swarm Gods v1.7.0
 * Validates the auto-repair system with all elite features
 */

import { AtomicRepair } from './dist/index.js';
import { existsSync } from 'fs';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║  ⚡ ATOMIC SWARM GODS ELITE v1.7.0 - TEST SUITE             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const config = {
  nodeVersion: process.version,
  wasmSupport: true,
  strictMode: true,
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

if (!existsSync('./dist/index.js')) {
  console.error('❌ dist/index.js not found. Run `npm run build` first.');
  process.exit(1);
}

try {
  const repair = new AtomicRepair(config);

  // Safe event listener
  if (typeof repair.on === 'function') {
    repair.on('repair_complete', (data) => {
      console.log(`\n📢 Event: Repair completed with success=${data?.success ?? 'unknown'}`);
    });
  }

  console.log('🔧 Running elite auto-repair...\n');
  const startTime = Date.now();
  const success = await repair.repair();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  ${success ? '✅' : '⚠️'} TEST COMPLETE - ${duration}s                                    ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('📊 Results:');
  console.log(`  • Status: ${success ? 'SUCCESS' : 'PARTIAL'}`);

  // Safe access to optional methods
  const attempts = typeof repair.getRepairAttempts === 'function' ? repair.getRepairAttempts() : 'N/A';
  const auditHistory = typeof repair.getAuditHistory === 'function' ? repair.getAuditHistory().length : 'N/A';
  const shiftMetrics = typeof repair.getShiftMetrics === 'function' ? repair.getShiftMetrics().length : 'N/A';
  const avgConfidence = typeof repair.getAverageConfidence === 'function' ? (repair.getAverageConfidence() * 100).toFixed(2) : 'N/A';
  const blockchainVerified = typeof repair.verifyBlockchain === 'function' ? (repair.verifyBlockchain() ? '✅' : '❌') : '⚠️ N/A';

  console.log(`  • Repair Attempts: ${attempts}`);
  console.log(`  • Audits Performed: ${auditHistory}`);
  console.log(`  • Dynamic Shifts: ${shiftMetrics}`);
  console.log(`  • Average Confidence: ${avgConfidence}%`);
  console.log(`  • Blockchain Verified: ${blockchainVerified}`);
  console.log('');

  process.exit(success ? 0 : 1);

} catch (error) {
  console.error('\n❌ TEST FAILED:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}