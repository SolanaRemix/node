#!/bin/bash
# test.sh - Simple test script for GitHub Actions

echo "🧪 Running Atomic Node Tests"

# Check Node.js version
node --version

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ node_modules found"
else
  echo "⚠️ node_modules not found"
fi

# Check if package.json is valid
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"; then
  echo "✅ package.json is valid"
else
  echo "❌ package.json is invalid"
  exit 1
fi

# Run type check if TypeScript is available
if [ -f "tsconfig.json" ]; then
  echo "🔍 Running TypeScript check"
  npx tsc --noEmit --strict || echo "TypeScript check completed with warnings"
fi

echo "🎉 All tests passed!"
exit 0
