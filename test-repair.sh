#!/bin/bash
# test-repair.sh - Quick test for Atomic Gods
echo "🧪 Testing Atomic Gods..."
curl -X POST http://localhost:3001/api/surgery/start \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/SolanaRemix/node.git","branchName":"test/repair","keepAfterRepair":false}'
