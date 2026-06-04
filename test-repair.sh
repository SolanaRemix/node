#!/bin/bash
# ============================================================
# test-repair.sh - Elite API Test Script
# Atomic Swarm Gods Elite v1.7.0
# ============================================================

set -euo pipefail  # Exit on error, undefined var, pipe failure

# Colors for output (skip if not a terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
REPO_URL="${REPO_URL:-https://github.com/SolanaRemix/node.git}"
BRANCH_NAME="${BRANCH_NAME:-test/repair-$(date +%s)}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 ATOMIC SWARM GODS ELITE v1.7.0 - API TEST               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check required tools
for cmd in curl jq; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${RED}❌ Required command not found: $cmd${NC}"
        exit 1
    fi
done

# Check if server is running
echo -e "${BLUE}📡 Checking server status...${NC}"
if curl -s -f -o /dev/null "${API_URL}/health"; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server not running at ${API_URL}${NC}"
    echo -e "${YELLOW}💡 Start server with: npm start${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Configuration:${NC}"
echo "  • API URL: ${API_URL}"
echo "  • Repo: ${REPO_URL}"
echo "  • Branch: ${BRANCH_NAME}"
echo ""

# ============================================================
# Phase 1: Start Surgery Session
# ============================================================
echo -e "${BLUE}🔧 Phase 1: Starting surgery session...${NC}"
START_RESPONSE=$(curl -s -X POST "${API_URL}/api/surgery/start" \
    -H "Content-Type: application/json" \
    -d "{\"repoUrl\":\"${REPO_URL}\",\"branchName\":\"${BRANCH_NAME}\",\"keepAfterRepair\":false,\"eliteConfig\":{\"dynamicShifting\":true,\"blockchainAudit\":true}}")

SESSION_ID=$(echo "$START_RESPONSE" | jq -r '.sessionId // empty')
if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}❌ Failed to start session${NC}"
    echo "$START_RESPONSE" | jq '.' 2>/dev/null || echo "$START_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Session started: ${SESSION_ID}${NC}"
echo ""

# ============================================================
# Phase 2: Clone Repository
# ============================================================
echo -e "${BLUE}📦 Phase 2: Cloning repository...${NC}"
CLONE_RESPONSE=$(curl -s -X POST "${API_URL}/api/surgery/clone" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"${SESSION_ID}\",\"repoUrl\":\"${REPO_URL}\",\"branchName\":\"${BRANCH_NAME}\"}")

if echo "$CLONE_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    echo -e "${RED}❌ Clone failed${NC}"
    echo "$CLONE_RESPONSE" | jq '.' 2>/dev/null || echo "$CLONE_RESPONSE"
    exit 1
fi
echo ""

# ============================================================
# Phase 3: Run Elite Auto-Repair
# ============================================================
echo -e "${BLUE}🔧 Phase 3: Running elite auto-repair...${NC}"
REPAIR_RESPONSE=$(curl -s -X POST "${API_URL}/api/surgery/elite-repair" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"${SESSION_ID}\",\"shiftStrategy\":\"adaptive\"}")

FIX_COUNT=$(echo "$REPAIR_RESPONSE" | jq -r '.fixes | length // 0')
if echo "$REPAIR_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Elite repair completed (${FIX_COUNT} fixes applied)${NC}"
    if [ "$FIX_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}  📝 Fixes applied:${NC}"
        echo "$REPAIR_RESPONSE" | jq -r '.fixes[]' 2>/dev/null | sed 's/^/    • /' || true
    fi
    AUDIT_HASH=$(echo "$REPAIR_RESPONSE" | jq -r '.auditHash // empty')
    if [ -n "$AUDIT_HASH" ]; then
        echo -e "${BLUE}  ⛓️ Blockchain hash: ${AUDIT_HASH:0:32}...${NC}"
    fi
else
    echo -e "${RED}❌ Elite repair failed${NC}"
    echo "$REPAIR_RESPONSE" | jq '.' 2>/dev/null || echo "$REPAIR_RESPONSE"
    exit 1
fi
echo ""

# ============================================================
# Phase 4: Check for Changes
# ============================================================
echo -e "${BLUE}🔍 Phase 4: Checking for changes...${NC}"
HAS_CHANGES=$(echo "$REPAIR_RESPONSE" | jq -r '.hasChanges // false')
if [ "$HAS_CHANGES" = "true" ]; then
    echo -e "${GREEN}✅ Changes detected, proceeding to commit...${NC}"
    
    COMMIT_RESPONSE=$(curl -s -X POST "${API_URL}/api/surgery/commit" \
        -H "Content-Type: application/json" \
        -d "{\"sessionId\":\"${SESSION_ID}\",\"commitMessage\":\"🤖 Elite Auto-Repair v1.7.0\"}")
    
    if echo "$COMMIT_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️ No changes to commit or commit failed${NC}"
    fi
else
    echo -e "${GREEN}✅ No changes needed - repository already healthy!${NC}"
fi
echo ""

# ============================================================
# Phase 5: Create PR (optional)
# ============================================================
if [ "$HAS_CHANGES" = "true" ]; then
    echo -e "${BLUE}📝 Phase 5: Creating pull request...${NC}"
    PR_RESPONSE=$(curl -s -X POST "${API_URL}/api/surgery/create-pr" \
        -H "Content-Type: application/json" \
        -d "{\"sessionId\":\"${SESSION_ID}\",\"prTitle\":\"🤖 Elite Auto-Repair v1.7.0\",\"prBody\":\"## 🤖 Elite Auto-Repair\\n\\nThis PR was automatically generated by Atomic Swarm Gods Elite v1.7.0\\n\\n### ✅ Changes Applied\\n\\n- Dynamic test shifting applied\\n- Blockchain audit recorded\\n- Self-healing optimizations\\n\",\"baseBranch\":\"main\"}")
    
    PR_NUMBER=$(echo "$PR_RESPONSE" | jq -r '.prNumber // empty')
    if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "null" ]; then
        echo -e "${GREEN}✅ Pull Request #${PR_NUMBER} created!${NC}"
    else
        echo -e "${YELLOW}⚠️ PR creation skipped or failed${NC}"
    fi
fi
echo ""

# ============================================================
# Summary
# ============================================================
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ ELITE TEST COMPLETE                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  • Session ID: ${SESSION_ID}"
echo "  • Fixes Applied: ${FIX_COUNT}"
echo "  • Changes: ${HAS_CHANGES}"
echo "  • Blockchain: $(echo "$REPAIR_RESPONSE" | jq -r '.auditHash // "N/A"')"
echo ""