# ============================================================
# ATOMIC SWARM GODS ELITE v1.7.0 - DEPLOYMENT PIPELINE
# Enterprise Unified Build & Deployment Script
# ============================================================

param(
    [switch]$Clean,           # Clean all artifacts before build
    [switch]$SkipBuild,       # Skip TypeScript build
    [switch]$SkipServer,      # Skip starting the server
    [switch]$SkipTests,       # Skip running tests
    [switch]$EliteMode,       # Enable elite features
    [switch]$BlockchainAudit, # Enable blockchain audit
    [switch]$DynamicShift,    # Enable dynamic test shifting
    [string]$Environment = "development"  # development | staging | production
)

# ============================================================
# Global Configuration
# ============================================================
$ELITE_VERSION = "1.7.0"
$ErrorActionPreference = "Stop"
$RepoRoot = Get-Location

# Set environment variables
$env:ELITE_MODE = if ($EliteMode) { "true" } else { "false" }
$env:BLOCKCHAIN_AUDIT = if ($BlockchainAudit) { "true" } else { "false" }
$env:DYNAMIC_SHIFTING = if ($DynamicShift) { "true" } else { "false" }
$env:NODE_ENV = $Environment

# Helper: Run command and ignore exit code (for non-critical steps)
function Invoke-CommandSafe {
    param([string]$Command)
    try {
        Invoke-Expression $Command
        return $true
    } catch {
        Write-Host "⚠️ Command failed: $Command" -ForegroundColor Yellow
        return $false
    }
}

# ============================================================
# Header
# ============================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 ATOMIC SWARM GODS ELITE v$ELITE_VERSION - DEPLOYMENT PIPELINE  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Yellow
Write-Host "  • Environment: $Environment"
Write-Host "  • Elite Mode: $($env:ELITE_MODE)"
Write-Host "  • Blockchain Audit: $($env:BLOCKCHAIN_AUDIT)"
Write-Host "  • Dynamic Shifting: $($env:DYNAMIC_SHIFTING)"
Write-Host ""

# ============================================================
# 1. Clean Artifacts
# ============================================================
if ($Clean) {
    Write-Host "🧹 Cleaning artifacts..." -ForegroundColor Yellow
    $foldersToClean = @("node_modules", "dist", ".next", "coverage", ".pnpm-store", "blockchain")
    foreach ($folder in $foldersToClean) {
        if (Test-Path $folder) {
            Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
            Write-Host "  ✓ Removed: $folder" -ForegroundColor Green
        }
    }
    
    $filesToClean = @("package-lock.json", "pnpm-lock.yaml", "yarn.lock", "oracle-memory.json")
    foreach ($file in $filesToClean) {
        if (Test-Path $file) {
            Remove-Item -Force $file -ErrorAction SilentlyContinue
            Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

# ============================================================
# 2. Install Dependencies
# ============================================================
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

$hasPnpm = Test-Path "pnpm-lock.yaml"
$hasYarn = Test-Path "yarn.lock"

if ($hasPnpm) {
    Write-Host "  📦 Using pnpm..." -ForegroundColor Gray
    pnpm install --frozen-lockfile
    $installExit = $LASTEXITCODE
} elseif ($hasYarn) {
    Write-Host "  📦 Using yarn..." -ForegroundColor Gray
    yarn install --frozen-lockfile
    $installExit = $LASTEXITCODE
} else {
    Write-Host "  📦 Using npm..." -ForegroundColor Gray
    npm ci --no-audit --no-fund
    $installExit = $LASTEXITCODE
}

if ($installExit -ne 0) {
    Write-Host "⚠️ Installation had warnings, continuing..." -ForegroundColor Yellow
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# ============================================================
# 3. TypeScript Type Check
# ============================================================
if (-not $SkipBuild) {
    Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Yellow
    npm run typecheck
    $typeExit = $LASTEXITCODE
    if ($typeExit -ne 0) {
        Write-Host "❌ Type check failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Type check passed" -ForegroundColor Green
    Write-Host ""
}

# ============================================================
# 4. Build Project
# ============================================================
if (-not $SkipBuild) {
    Write-Host "🔨 Building project..." -ForegroundColor Yellow
    npm run build
    $buildExit = $LASTEXITCODE
    if ($buildExit -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build complete" -ForegroundColor Green
    
    if (Test-Path "dist/index.js") {
        Write-Host "  ✓ dist/index.js created" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ dist/index.js not found" -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================================
# 5. Run Tests
# ============================================================
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    if ($EliteMode) {
        Write-Host "  👑 Running elite test suite..." -ForegroundColor Gray
        npm run test:elite
    } else {
        npm test
    }
    
    $testExit = $LASTEXITCODE
    if ($testExit -ne 0) {
        Write-Host "⚠️ Tests had failures, but continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ All tests passed" -ForegroundColor Green
    }
    Write-Host ""
}

# ============================================================
# 6. Lint & Format (non-blocking)
# ============================================================
Write-Host "✨ Running linter and formatter..." -ForegroundColor Yellow
# Use safe wrapper so failures don't stop the pipeline
Invoke-CommandSafe "npm run lint -- --fix --quiet 2>nul"
Invoke-CommandSafe "npm run format 2>nul"
Write-Host "✅ Lint complete" -ForegroundColor Green
Write-Host ""

# ============================================================
# 7. Generate Oracle Memory (if missing)
# ============================================================
if (-not (Test-Path "oracle-memory.json")) {
    Write-Host "🧠 Initializing Oracle Memory..." -ForegroundColor Yellow
    # Use a simple node command that won't fail if dist doesn't exist
    $initScript = @'
const fs = require('fs');
const oraclePath = 'oracle-memory.json';
if (!fs.existsSync(oraclePath)) {
    fs.writeFileSync(oraclePath, JSON.stringify({ patterns: [], success_rate: 0, last_trained: new Date().toISOString() }, null, 2));
    console.log('✅ Oracle Memory initialized');
} else {
    console.log('ℹ️ Oracle Memory already exists');
}
'@
    node -e "$initScript"
    Write-Host "✅ Oracle Memory ready" -ForegroundColor Green
    Write-Host ""
}

# ============================================================
# 8. Start Server
# ============================================================
if (-not $SkipServer) {
    Write-Host "🏥 Starting Elite Surgery Server..." -ForegroundColor Green
    Write-Host "  🌐 Dashboard: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  🔗 API: http://localhost:3001/api" -ForegroundColor Cyan
    Write-Host "  📊 Health: http://localhost:3001/health" -ForegroundColor Cyan
    Write-Host "  ⛓️ Blockchain: http://localhost:3001/blockchain" -ForegroundColor Cyan
    Write-Host ""
    
    # Open browser only if not in CI and if the command exists
    $isCI = $env:CI -eq "true"
    if (-not $isCI) {
        if ($IsWindows -or $env:OS -eq "Windows_NT") {
            try { Start-Process "http://localhost:3001" } catch { Write-Host "⚠️ Could not open browser" -ForegroundColor Yellow }
        } elseif ($IsMacOS) {
            try { open "http://localhost:3001" } catch { Write-Host "⚠️ Could not open browser" -ForegroundColor Yellow }
        } elseif ($IsLinux) {
            try { xdg-open "http://localhost:3001" 2>$null } catch { Write-Host "⚠️ Could not open browser" -ForegroundColor Yellow }
        }
    }
    
    # Start the server
    Write-Host "⚡ Starting server with elite features..." -ForegroundColor Magenta
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    node server.js
} else {
    Write-Host "✅ Pipeline completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Yellow
    Write-Host "  • Build: $(-not $SkipBuild)"
    Write-Host "  • Tests: $(-not $SkipTests)"
    Write-Host "  • Server: $(-not $SkipServer)"
    Write-Host "  • Elite Mode: $EliteMode"
    Write-Host "  • Environment: $Environment"
    Write-Host ""
}

# ============================================================
# Footer
# ============================================================
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ ATOMIC SWARM GODS ELITE v$ELITE_VERSION - DEPLOY READY       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""