#!/usr/bin/env node
import fs from 'node:fs';

const reportPath = process.argv[2];
if (!reportPath) {
  console.error('Usage: node scripts/check-security-audit.js <audit-json-path>');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const vulnerabilities = audit.metadata?.vulnerabilities || {};
const critical = vulnerabilities.critical || 0;
const high = vulnerabilities.high || 0;

if (critical > 0 || high > 0) {
  console.error('High/Critical vulnerabilities detected', { critical, high });
  process.exit(1);
}

console.log('Audit gate passed', { critical, high });
