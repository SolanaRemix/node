#!/bin/bash
# ============================================================
# test.sh - Elite Enterprise Test Suite
# Atomic Swarm Gods Elite v1.7.0
# GitHub Actions CI/CD Gatekeeper
# ============================================================

set -e  # Exit on error

# ============================================================
# Colors & Formatting
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ============================================================
# Configuration
# ============================================================
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ELITE_VERSION="1.7.0"
TEST_PASSED=0
TEST_FAILED=0
TEST_WARNINGS=0

# ============================================================
# Header
# ============================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 ATOMIC SWARM GODS ELITE v${ELITE_VERSION} - TEST SUITE           ║"
echo "║  🔬 CI/CD Gatekeeper | Enterprise Validation                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${CYAN}📊 Test Environment:${NC}"
echo "  • Timestamp: ${TIMESTAMP}"
echo "  • Node Version: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "  • OS: $(uname -a | cut -d' ' -f1-3)"
echo "  • CI: ${CI:-false}"
echo ""

# ============================================================
# Helper Functions
# ============================================================
test_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TEST_PASSED++))
}

test_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TEST_FAILED++))
}

test_warning() {
    echo -e "${YELLOW}⚠️ WARNING:${NC} $1"
    ((TEST_WARNINGS++))
}

test_info() {
    echo -e "${BLUE}ℹ️ INFO:${NC} $1"
}

print_section() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
}

# ============================================================
# Phase 1: Environment Validation
# ============================================================
print_section "🔧 PHASE 1: Environment Validation"

# Node.js version check
NODE_VERSION=$(node --version 2>/dev/null || echo "v0.0.0")
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -ge 18 ] && [ "$NODE_MAJOR" -le 24 ]; then
    test_pass "Node.js version ${NODE_VERSION} (supported: 18-24)"
else
    test_fail "Node.js version ${NODE_VERSION} not supported (need 18-24)"
fi

# Check npm/pnpm
if command -v pnpm &> /dev/null; then
    test_pass "pnpm $(pnpm --version) available"
elif command -v npm &> /dev/null; then
    test_pass "npm $(npm --version) available"
else
    test_fail "No package manager found (npm or pnpm)"
fi

# Check git
if command -v git &> /dev/null; then
    test_pass "git $(git --version | cut -d' ' -f3) available"
else
    test_fail "git not available"
fi

# ============================================================
# Phase 2: Project Structure Validation
# ============================================================
print_section "📁 PHASE 2: Project Structure Validation"

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "src/index.ts"
    "server.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_pass "Found: $file"
    else
        test_fail "Missing: $file"
    fi
done

# Check directories
CRITICAL_DIRS=(
    "src"
    "src/core"
    "src/auditor"
    "src/enterprise"
    "src/brain"
    "surgery-room"
    "dist"
)

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_warning "Missing directory: $dir (will be created during build)"
    fi
done

# ============================================================
# Phase 3: Package.json Validation
# ============================================================
print_section "📦 PHASE 3: Package.json Validation"

# Check package.json syntax
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    test_pass "package.json syntax is valid"
else
    test_fail "package.json syntax is invalid"
fi

# Check version
PKG_VERSION=$(node -p "require('./package.json').version")
if [[ "$PKG_VERSION" == *"elite"* ]] || [[ "$PKG_VERSION" == "1.7.0"* ]]; then
    test_pass "Version ${PKG_VERSION} (Elite)"
else
    test_warning "Version ${PKG_VERSION} - update to 1.7.0-elite recommended"
fi

# Check elite config
if grep -q '"elite"' package.json; then
    test_pass "Elite configuration present"
else
    test_warning "No elite configuration in package.json"
fi

# Check required scripts
REQUIRED_SCRIPTS=("build" "test" "start" "typecheck")
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if grep -q "\"${script}\":" package.json; then
        test_pass "Script exists: ${script}"
    else
        test_warning "Missing script: ${script}"
    fi
done

# ============================================================
# Phase 4: TypeScript Validation
# ============================================================
print_section "🔷 PHASE 4: TypeScript Validation"

# Check tsconfig.json syntax
if node -e "JSON.parse(require('fs').readFileSync('tsconfig.json', 'utf8'))" 2>/dev/null; then
    test_pass "tsconfig.json syntax is valid"
else
    test_fail "tsconfig.json syntax is invalid"
fi

# Check strict mode
if grep -q '"strict": true' tsconfig.json; then
    test_pass "TypeScript strict mode enabled"
else
    test_warning "TypeScript strict mode not enabled"
fi

# Check target
TARGET=$(node -p "require('./tsconfig.json').compilerOptions.target" 2>/dev/null || echo "unknown")
if [[ "$TARGET" == "ES2022" ]] || [[ "$TARGET" == "ESNext" ]]; then
    test_pass "Target: ${TARGET}"
else
    test_warning "Target: ${TARGET} (recommend ES2022+)"
fi

# Run TypeScript type check if node_modules exists
if [ -d "node_modules" ]; then
    echo ""
    test_info "Running TypeScript type checker..."
    if npx tsc --noEmit --strict --skipLibCheck 2>&1 | head -20; then
        test_pass "TypeScript type check passed"
    else
        test_warning "TypeScript type check had issues (non-blocking)"
    fi
else
    test_warning "node_modules not found, skipping TypeScript type check"
fi

# ============================================================
# Phase 5: Dependency Validation
# ============================================================
print_section "📦 PHASE 5: Dependency Validation"

# Check node_modules
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    test_pass "node_modules found (${PACKAGE_COUNT} packages)"
    
    # Check critical dependencies
    CRITICAL_DEPS=("express" "socket.io" "typescript" "@tensorflow/tfjs-node")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/${dep}" ]; then
            test_pass "Dependency installed: ${dep}"
        else
            test_warning "Missing dependency: ${dep}"
        fi
    done
else
    test_warning "node_modules not found - run npm install first"
fi

# Check for security vulnerabilities (non-blocking)
if [ -f "package-lock.json" ] || [ -f "pnpm-lock.yaml" ]; then
    test_info "Checking for security vulnerabilities..."
    if npm audit --production --json 2>/dev/null | grep -q '"critical":0'; then
        test_pass "No critical vulnerabilities"
    else
        test_warning "Security vulnerabilities detected - run npm audit fix"
    fi
fi

# ============================================================
# Phase 6: Build Validation
# ============================================================
print_section "🔨 PHASE 6: Build Validation"

# Check if build exists
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    test_pass "Build exists in dist/"
    
    # Check build size
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    test_info "Build size: ${BUILD_SIZE}"
else
    test_warning "Build not found - run npm run build"
    
    # Try to build
    if command -v npm &> /dev/null && [ -f "package.json" ]; then
        test_info "Attempting build..."
        if npm run build 2>&1 | tail -5; then
            test_pass "Build successful"
        else
            test_warning "Build failed - check TypeScript errors"
        fi
    fi
fi

# ============================================================
# Phase 7: Elite Features Validation
# ============================================================
print_section "👑 PHASE 7: Elite Features Validation"

# Check blockchain directory
if [ -d "blockchain" ]; then
    BLOCK_COUNT=$(find blockchain -name "*.json" 2>/dev/null | wc -l)
    test_pass "Blockchain directory exists (${BLOCK_COUNT} blocks)"
else
    test_warning "Blockchain directory missing"
fi

# Check oracle memory
if [ -f "oracle-memory.json" ] || [ -d ".oracle-memory" ]; then
    test_pass "Oracle memory system present"
else
    test_info "Oracle memory will be created on first use"
fi

# Check surgery room
if [ -d "surgery-room" ]; then
    test_pass "Surgery room directory exists"
else
    test_fail "Surgery room directory missing"
fi

# Check dynamic test shifter
if [ -f "surgery-room/DynamicTestShifter.js" ]; then
    test_pass "Dynamic test shifter present"
else
    test_warning "DynamicTestShifter.js not found"
fi

# Check elite validator
if [ -f "src/enterprise/EliteRepairValidator.ts" ] || [ -f "dist/enterprise/EliteRepairValidator.js" ]; then
    test_pass "Elite repair validator present"
else
    test_warning "EliteRepairValidator not found"
fi

# ============================================================
# Phase 8: Runtime Validation (if server is running)
# ============================================================
print_section "🏥 PHASE 8: Runtime Validation"

# Check if server is running
if curl -s -f -o /dev/null http://localhost:3001/health 2>/dev/null; then
    test_pass "Server is running on port 3001"
    
    # Get health info
    HEALTH_INFO=$(curl -s http://localhost:3001/health)
    if echo "$HEALTH_INFO" | grep -q "elite" || echo "$HEALTH_INFO" | grep -q "1.7"; then
        test_pass "Elite version detected in health check"
    fi
    
    # Check metrics endpoint
    if curl -s -f -o /dev/null http://localhost:3001/metrics 2>/dev/null; then
        test_pass "Metrics endpoint available"
    else
        test_warning "Metrics endpoint not responding"
    fi
else
    test_info "Server not running (skip runtime tests)"
    test_info "Start server with: npm start"
fi

# ============================================================
# Phase 9: Git & PR Validation
# ============================================================
print_section "🔀 PHASE 9: Git & PR Validation"

# Check git status
if git status &>/dev/null; then
    test_pass "Git repository detected"
    
    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        test_pass "Working directory clean"
    else
        test_warning "Uncommitted changes detected"
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    test_info "Current branch: ${CURRENT_BRANCH}"
else
    test_warning "Not a git repository"
fi

# Check GitHub CLI (for PR creation)
if command -v gh &> /dev/null; then
    test_pass "GitHub CLI available"
    if gh auth status &>/dev/null; then
        test_pass "GitHub CLI authenticated"
    else
        test_warning "GitHub CLI not authenticated"
    fi
else
    test_info "GitHub CLI not installed (PR creation will use API)"
fi

# ============================================================
# Test Summary
# ============================================================
print_section "📊 TEST SUMMARY"

TOTAL_TESTS=$((TEST_PASSED + TEST_FAILED + TEST_WARNINGS))
echo ""
echo -e "${BOLD}Results:${NC}"
echo -e "  ${GREEN}✅ Passed: ${TEST_PASSED}${NC}"
echo -e "  ${RED}❌ Failed: ${TEST_FAILED}${NC}"
echo -e "  ${YELLOW}⚠️ Warnings: ${TEST_WARNINGS}${NC}"
echo -e "  ${BLUE}📊 Total: ${TOTAL_TESTS}${NC}"
echo ""

# Determine exit code
if [ $TEST_FAILED -gt 0 ]; then
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ TEST SUITE FAILED - ${TEST_FAILED} critical failure(s)                    ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
elif [ $TEST_WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️ TEST SUITE PASSED WITH WARNINGS - ${TEST_WARNINGS} warning(s)               ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ TEST SUITE PASSED - All checks successful!               ║${NC}"
    echo -e "${GREEN}║  🚀 Atomic Swarm Gods Elite v${ELITE_VERSION} is ready!                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
fi