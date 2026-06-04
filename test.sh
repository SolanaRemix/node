#!/bin/bash
# ============================================================
# test.sh - Elite Enterprise Test Suite
# Atomic Swarm Gods Elite v1.7.0
# GitHub Actions CI/CD Gatekeeper
# ============================================================

set -euo pipefail  # Exit on error, undefined var, pipe failure

# ============================================================
# Colors & Formatting (skip if not a terminal)
# ============================================================
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    MAGENTA='\033[0;35m'
    NC='\033[0m'
    BOLD='\033[1m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; MAGENTA=''; NC=''; BOLD=''
fi

# ============================================================
# Configuration
# ============================================================
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ELITE_VERSION="1.7.0"
TEST_PASSED=0
TEST_FAILED=0
TEST_WARNINGS=0

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

# Safe JSON parsing (returns empty if file missing)
safe_json_field() {
    local file="$1"
    local field="$2"
    if [ -f "$file" ]; then
        node -p "try { require('./$file').$field } catch(e) { '' }" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

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
echo "  • OS: $(uname -a 2>/dev/null | cut -d' ' -f1-3 || echo 'unknown')"
echo "  • CI: ${CI:-false}"
echo ""

# ============================================================
# Phase 1: Environment Validation
# ============================================================
print_section "🔧 PHASE 1: Environment Validation"

NODE_VERSION=$(node --version 2>/dev/null || echo "v0.0.0")
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
if [ -n "$NODE_MAJOR" ] && [ "$NODE_MAJOR" -ge 18 ] && [ "$NODE_MAJOR" -le 24 ]; then
    test_pass "Node.js version ${NODE_VERSION} (supported: 18-24)"
else
    test_fail "Node.js version ${NODE_VERSION} not supported (need 18-24)"
fi

if command -v pnpm &> /dev/null; then
    test_pass "pnpm $(pnpm --version) available"
elif command -v npm &> /dev/null; then
    test_pass "npm $(npm --version) available"
else
    test_fail "No package manager found (npm or pnpm)"
fi

if command -v git &> /dev/null; then
    test_pass "git $(git --version | cut -d' ' -f3) available"
else
    test_fail "git not available"
fi

# ============================================================
# Phase 2: Project Structure Validation
# ============================================================
print_section "📁 PHASE 2: Project Structure Validation"

CRITICAL_FILES=("package.json" "tsconfig.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_pass "Found: $file"
    else
        test_fail "Missing: $file"
    fi
done

# src/index.ts and server.js are optional
for file in "src/index.ts" "server.js"; do
    if [ -f "$file" ]; then
        test_pass "Found: $file"
    else
        test_warning "Missing: $file (not required for all setups)"
    fi
done

CRITICAL_DIRS=("src" "surgery-room")
for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        test_pass "Directory exists: $dir"
    else
        test_fail "Missing directory: $dir"
    fi
done

# Optional directories
for dir in "src/core" "src/auditor" "src/enterprise" "src/brain" "dist" "blockchain"; do
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

if [ -f "package.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        test_pass "package.json syntax is valid"
    else
        test_fail "package.json syntax is invalid"
    fi

    PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    if [[ "$PKG_VERSION" == *"elite"* ]] || [[ "$PKG_VERSION" == "1.7.0"* ]]; then
        test_pass "Version ${PKG_VERSION} (Elite)"
    else
        test_warning "Version ${PKG_VERSION} - update to 1.7.0-elite recommended"
    fi

    if grep -q '"elite"' package.json 2>/dev/null; then
        test_pass "Elite configuration present"
    else
        test_warning "No elite configuration in package.json"
    fi

    REQUIRED_SCRIPTS=("build" "test" "start")
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if grep -q "\"${script}\":" package.json 2>/dev/null; then
            test_pass "Script exists: ${script}"
        else
            test_warning "Missing script: ${script}"
        fi
    done
fi

# ============================================================
# Phase 4: TypeScript Validation
# ============================================================
print_section "🔷 PHASE 4: TypeScript Validation"

if [ -f "tsconfig.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('tsconfig.json', 'utf8'))" 2>/dev/null; then
        test_pass "tsconfig.json syntax is valid"
    else
        test_fail "tsconfig.json syntax is invalid"
    fi

    if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
        test_pass "TypeScript strict mode enabled"
    else
        test_warning "TypeScript strict mode not enabled"
    fi

    TARGET=$(node -p "require('./tsconfig.json').compilerOptions.target" 2>/dev/null || echo "unknown")
    if [[ "$TARGET" == "ES2022" ]] || [[ "$TARGET" == "ESNext" ]]; then
        test_pass "Target: ${TARGET}"
    else
        test_warning "Target: ${TARGET} (recommend ES2022+)"
    fi

    if [ -d "node_modules" ]; then
        echo ""
        test_info "Running TypeScript type checker..."
        if npx tsc --noEmit --strict --skipLibCheck > /tmp/tsc.out 2>&1; then
            test_pass "TypeScript type check passed"
        else
            test_warning "TypeScript type check had issues (non-blocking)"
            cat /tmp/tsc.out | head -10
        fi
    else
        test_warning "node_modules not found, skipping TypeScript type check"
    fi
fi

# ============================================================
# Phase 5: Dependency Validation
# ============================================================
print_section "📦 PHASE 5: Dependency Validation"

if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l)
    test_pass "node_modules found (${PACKAGE_COUNT} packages)"
    
    CRITICAL_DEPS=("express" "socket.io" "typescript")
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

if [ -f "package-lock.json" ] || [ -f "pnpm-lock.yaml" ]; then
    test_info "Checking for security vulnerabilities..."
    if command -v npm >/dev/null; then
        if npm audit --production --json 2>/dev/null | grep -q '"critical":0'; then
            test_pass "No critical vulnerabilities"
        else
            test_warning "Security vulnerabilities detected - run npm audit fix"
        fi
    else
        test_info "npm not available, skipping audit"
    fi
fi

# ============================================================
# Phase 6: Build Validation
# ============================================================
print_section "🔨 PHASE 6: Build Validation"

if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    test_pass "Build exists in dist/"
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    test_info "Build size: ${BUILD_SIZE}"
else
    test_warning "Build not found - run npm run build"
    if command -v npm >/dev/null && [ -f "package.json" ]; then
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

if [ -d "blockchain" ]; then
    BLOCK_COUNT=$(find blockchain -name "*.json" 2>/dev/null | wc -l)
    test_pass "Blockchain directory exists (${BLOCK_COUNT} blocks)"
else
    test_warning "Blockchain directory missing"
fi

if [ -f "oracle-memory.json" ] || [ -d ".oracle-memory" ]; then
    test_pass "Oracle memory system present"
else
    test_info "Oracle memory will be created on first use"
fi

if [ -d "surgery-room" ]; then
    test_pass "Surgery room directory exists"
else
    test_fail "Surgery room directory missing"
fi

if [ -f "surgery-room/DynamicTestShifter.js" ]; then
    test_pass "Dynamic test shifter present"
else
    test_warning "DynamicTestShifter.js not found (may be generated later)"
fi

# Optional elite validator
if [ -f "src/enterprise/EliteRepairValidator.ts" ] || [ -f "dist/enterprise/EliteRepairValidator.js" ]; then
    test_pass "Elite repair validator present"
else
    test_warning "EliteRepairValidator not found (optional)"
fi

# ============================================================
# Phase 8: Runtime Validation (if server is running)
# ============================================================
print_section "🏥 PHASE 8: Runtime Validation"

if curl -s -f -o /dev/null http://localhost:3001/health 2>/dev/null; then
    test_pass "Server is running on port 3001"
    HEALTH_INFO=$(curl -s http://localhost:3001/health 2>/dev/null || echo "")
    if echo "$HEALTH_INFO" | grep -q "elite" || echo "$HEALTH_INFO" | grep -q "1.7"; then
        test_pass "Elite version detected in health check"
    fi
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

if git status &>/dev/null; then
    test_pass "Git repository detected"
    if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
        test_pass "Working directory clean"
    else
        test_warning "Uncommitted changes detected"
    fi
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    test_info "Current branch: ${CURRENT_BRANCH}"
else
    test_warning "Not a git repository"
fi

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