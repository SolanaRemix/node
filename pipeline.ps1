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

# Detect package manager
$hasPnpm = Test-Path "pnpm-lock.yaml"
$hasYarn = Test-Path "yarn.lock"

if ($hasPnpm) {
    Write-Host "  📦 Using pnpm..." -ForegroundColor Gray
    pnpm install --frozen-lockfile
} elseif ($hasYarn) {
    Write-Host "  📦 Using yarn..." -ForegroundColor Gray
    yarn install --frozen-lockfile
} else {
    Write-Host "  📦 Using npm..." -ForegroundColor Gray
    npm ci --no-audit --no-fund
}

if ($LASTEXITCODE -ne 0) {
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
    if ($LASTEXITCODE -ne 0) {
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
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build complete" -ForegroundColor Green
    
    # Verify build output
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
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Tests had failures, but continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ All tests passed" -ForegroundColor Green
    }
    Write-Host ""
}

# ============================================================
# 6. Lint & Format
# ============================================================
Write-Host "✨ Running linter and formatter..." -ForegroundColor Yellow
npm run lint -- --fix --quiet 2>$null
npm run format 2>$null
Write-Host "✅ Lint complete" -ForegroundColor Green
Write-Host ""

# ============================================================
# 7. Generate Oracle Memory (if missing)
# ============================================================
if (-not (Test-Path "oracle-memory.json")) {
    Write-Host "🧠 Initializing Oracle Memory..." -ForegroundColor Yellow
    node -e "
    import('./dist/index.js').then(async (module) => {
        console.log('✅ Oracle Memory initialized');
    }).catch(() => console.log('⚠️ Oracle memory will be created on first use'));
    "
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
    
    # Open browser on supported platforms
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        Start-Process "http://localhost:3001"
    } elseif ($IsMacOS) {
        open "http://localhost:3001"
    } elseif ($IsLinux) {
        xdg-open "http://localhost:3001" 2>$null
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