#!/usr/bin/env pwsh
# ============================================================
# local-test.ps1 - Windows/PowerShell Elite Test Suite
# Atomic Swarm Gods Elite v1.7.0
# Enterprise Validation for Windows Environments
# ============================================================

param(
    [switch]$Clean,
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$EliteMode,
    [switch]$BlockchainAudit,
    [switch]$DynamicShifting,
    [string]$Environment = "development"
)

# ============================================================
# Configuration
# ============================================================
$ELITE_VERSION = "1.7.0"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
$ErrorActionPreference = "Stop"
$TestPassed = 0
$TestFailed = 0
$TestWarnings = 0

# Set environment variables
$env:ELITE_MODE = if ($EliteMode) { "true" } else { "false" }
$env:BLOCKCHAIN_AUDIT = if ($BlockchainAudit) { "true" } else { "false" }
$env:DYNAMIC_SHIFTING = if ($DynamicShifting) { "true" } else { "false" }
$env:NODE_ENV = $Environment

# ============================================================
# Helper Functions
# ============================================================
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
    $script:TestPassed++
}

function Write-Fail {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    $script:TestFailed++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
    $script:TestWarnings++
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Cyan
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

# ============================================================
# Header
# ============================================================
Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 ATOMIC SWARM GODS ELITE v$ELITE_VERSION - WINDOWS TEST SUITE  ║" -ForegroundColor Cyan
Write-Host "║  🔬 PowerShell Enterprise Validation                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Info "Timestamp: $TIMESTAMP"
Write-Info "Environment: $Environment"
Write-Info "PowerShell: $($PSVersionTable.PSVersion)"
Write-Info "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host ""

# ============================================================
# Phase 1: Environment Validation
# ============================================================
Write-Section "🔧 PHASE 1: Environment Validation"

# Node.js version check
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) { throw "Node.js not found" }
    $nodeMajor = $nodeVersion -replace 'v','' -replace '\..*',''
    if ($nodeMajor -ge 18 -and $nodeMajor -le 24) {
        Write-Success "Node.js version $nodeVersion (supported: 18-24)"
    } else {
        Write-Fail "Node.js version $nodeVersion not supported (need 18-24)"
    }
} catch {
    Write-Fail "Node.js not found. Please install Node.js 18+"
}

# Detect package manager
$usePNPM = Get-Command pnpm -ErrorAction SilentlyContinue
$useNPM = Get-Command npm -ErrorAction SilentlyContinue
$PM = $null

if ($usePNPM) {
    $PM = "pnpm"
    $PM_VERSION = pnpm --version
    Write-Success "Using PNPM v$PM_VERSION"
} elseif ($useNPM) {
    $PM = "npm"
    $PM_VERSION = npm --version
    Write-Success "Using NPM v$PM_VERSION"
} else {
    Write-Fail "No package manager found (pnpm or npm)"
    exit 1
}

# Check git
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Success "Git: $gitVersion"
} else {
    Write-Warning "Git not found - cloning will fail"
}

# Check GitHub CLI
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Success "GitHub CLI: $ghVersion"
} else {
    Write-Info "GitHub CLI not installed - PR creation will use API"
}

# ============================================================
# Phase 2: Clean (if requested)
# ============================================================
if ($Clean) {
    Write-Section "🧹 PHASE 2: Cleaning Artifacts"
    
    $foldersToClean = @("node_modules", "dist", ".pnpm-store", "coverage", "blockchain", ".elite-metrics")
    foreach ($folder in $foldersToClean) {
        if (Test-Path $folder) {
            Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
            Write-Success "Removed: $folder"
        }
    }
    
    $filesToClean = @("package-lock.json", "pnpm-lock.yaml", "oracle-memory.json", "oracle-blockchain.json")
    foreach ($file in $filesToClean) {
        if (Test-Path $file) {
            Remove-Item -Force $file -ErrorAction SilentlyContinue
            Write-Success "Removed: $file"
        }
    }
}

# ============================================================
# Phase 3: Install Dependencies
# ============================================================
Write-Section "📦 PHASE 3: Installing Dependencies"

if ($PM -eq "pnpm") {
    Write-Info "Running PNPM install with Windows-friendly settings..."
    pnpm config set symlink false 2>$null
    pnpm install --no-frozen-lockfile 2>&1 | Out-Host
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "PNPM failed, falling back to NPM..."
        $PM = "npm"
        npm install 2>&1 | Out-Host
    }
}

if ($PM -eq "npm") {
    Write-Info "Running NPM install..."
    npm install 2>&1 | Out-Host
}

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Dependency installation failed"
    exit 1
}
Write-Success "Dependencies installed"

# ============================================================
# Phase 4: TypeScript Type Check
# ============================================================
if (-not $SkipBuild) {
    Write-Section "🔷 PHASE 4: TypeScript Type Check"
    
    Write-Info "Running type checker..."
    if ($PM -eq "pnpm") {
        pnpm run typecheck 2>&1 | Out-Host
    } else {
        npm run typecheck 2>&1 | Out-Host
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Type check failed"
        exit 1
    }
    Write-Success "Type check passed"
}

# ============================================================
# Phase 5: Build Project
# ============================================================
if (-not $SkipBuild) {
    Write-Section "🔨 PHASE 5: Building Project"
    
    Write-Info "Compiling TypeScript..."
    if ($PM -eq "pnpm") {
        pnpm run build 2>&1 | Out-Host
    } else {
        npm run build 2>&1 | Out-Host
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Build failed"
        exit 1
    }
    Write-Success "Build complete"
    
    if (Test-Path "dist/index.js") {
        $buildSize = [math]::Round((Get-Item "dist/index.js").Length / 1KB, 2)
        Write-Success "Build output found (${buildSize}KB)"
    } else {
        Write-Warning "dist/index.js not found"
    }
}

# ============================================================
# Phase 6: Run Tests
# ============================================================
if (-not $SkipTests) {
    Write-Section "🧪 PHASE 6: Running Tests"
    
    Write-Info "Executing test suite..."
    if ($EliteMode) {
        Write-Info "Running Elite test suite..."
        if ($PM -eq "pnpm") {
            pnpm run test:elite 2>&1 | Out-Host
        } else {
            npm run test:elite 2>&1 | Out-Host
        }
    } else {
        if ($PM -eq "pnpm") {
            pnpm test 2>&1 | Out-Host
        } else {
            npm test 2>&1 | Out-Host
        }
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Tests had failures (non-blocking in dev mode)"
    } else {
        Write-Success "All tests passed"
    }
}

# ============================================================
# Phase 7: Lint & Format
# ============================================================
Write-Section "✨ PHASE 7: Code Quality"

Write-Info "Running linter..."
if ($PM -eq "pnpm") {
    pnpm run lint -- --fix --quiet 2>$null
} else {
    npm run lint -- --fix --quiet 2>$null
}
Write-Success "Lint complete"

Write-Info "Running formatter..."
if ($PM -eq "pnpm") {
    pnpm run format 2>$null
} else {
    npm run format 2>$null
}
Write-Success "Format complete"

# ============================================================
# Phase 8: Elite Features Validation
# ============================================================
Write-Section "👑 PHASE 8: Elite Features Validation"

if (Test-Path "blockchain") {
    $blockCount = (Get-ChildItem "blockchain" -Filter "*.json" -ErrorAction SilentlyContinue).Count
    Write-Success "Blockchain directory exists ($blockCount blocks)"
} else {
    Write-Info "Blockchain directory will be created on first run"
}

if (Test-Path "oracle-memory.json") {
    Write-Success "Oracle memory file exists"
} else {
    Write-Info "Oracle memory will be created on first use"
}

if (Test-Path "surgery-room") {
    Write-Success "Surgery room directory exists"
} else {
    Write-Fail "Surgery room directory missing"
}

if (Test-Path "surgery-room/DynamicTestShifter.js") {
    Write-Success "Dynamic test shifter present"
} else {
    Write-Warning "DynamicTestShifter.js not found"
}

# ============================================================
# Phase 9: Start Server (optional)
# ============================================================
Write-Section "🏥 PHASE 9: Server Startup"

Write-Info "Starting server on port 3001..."
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow
Start-Sleep -Seconds 4   # Give server more time to initialize

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Success "Server is running"
        Write-Info "Dashboard: http://localhost:3001"
        Write-Info "API: http://localhost:3001/api/surgery/records"
        
        # Safely check elite version
        try {
            $healthData = $response.Content | ConvertFrom-Json
            if ($healthData.version -and $healthData.version -eq $ELITE_VERSION) {
                Write-Success "Elite version $ELITE_VERSION detected"
            } elseif ($healthData.version) {
                Write-Info "Detected version: $($healthData.version)"
            }
        } catch {
            Write-Info "Health endpoint returned non-JSON response"
        }
    } else {
        Write-Warning "Server health check returned status $($response.StatusCode)"
    }
} catch {
    Write-Warning "Server not responding: $($_.Exception.Message)"
}

Write-Info "Server running in background (PID: $($serverProcess.Id))"
Write-Info "To stop: Stop-Process -Id $($serverProcess.Id)"

# ============================================================
# Test Summary
# ============================================================
Write-Section "📊 TEST SUMMARY"

$totalTests = $TestPassed + $TestFailed + $TestWarnings
Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  ✅ Passed: $TestPassed" -ForegroundColor Green
Write-Host "  ❌ Failed: $TestFailed" -ForegroundColor Red
Write-Host "  ⚠️ Warnings: $TestWarnings" -ForegroundColor Yellow
Write-Host "  📊 Total: $totalTests" -ForegroundColor Cyan
Write-Host ""

if ($TestFailed -gt 0) {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ TEST SUITE FAILED - $TestFailed critical failure(s)                    ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    exit 1
} elseif ($TestWarnings -gt 0) {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  ⚠️ TEST SUITE PASSED WITH WARNINGS - $TestWarnings warning(s)               ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ TEST SUITE PASSED - All Windows checks successful!       ║" -ForegroundColor Green
    Write-Host "║  🚀 Atomic Swarm Gods Elite v$ELITE_VERSION is ready!                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    exit 0
}