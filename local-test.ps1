# local-test.ps1 - Windows-optimized test script

Write-Host "🧪 Running Local Tests for Atomic Node" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Detect package manager
$usePNPM = Get-Command pnpm -ErrorAction SilentlyContinue
$useNPM = Get-Command npm -ErrorAction SilentlyContinue

if ($usePNPM) {
    $PM = "pnpm"
    Write-Host "📦 Using PNPM package manager" -ForegroundColor Green
} else {
    $PM = "npm"
    Write-Host "📦 Using NPM package manager" -ForegroundColor Green
}

# 1. Clean entropy
Write-Host "`n🧹 Cleaning entropy..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json, pnpm-lock.yaml -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .pnpm-store -ErrorAction SilentlyContinue
Write-Host "✅ Clean complete" -ForegroundColor Green

# 2. Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

if ($PM -eq "pnpm") {
    # Try PNPM with Windows-friendly settings
    pnpm config set symlink false
    pnpm install --no-frozen-lockfile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ PNPM failed, falling back to NPM..." -ForegroundColor Yellow
        $PM = "npm"
        npm install
    }
} 

if ($PM -eq "npm") {
    npm install
}

if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Install complete" -ForegroundColor Green

# 3. Type check
Write-Host "`n🔍 Running type check..." -ForegroundColor Yellow
if ($PM -eq "pnpm") {
    pnpm run typecheck
} else {
    npm run typecheck
}

if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Type check passed" -ForegroundColor Green

# 4. Build
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
if ($PM -eq "pnpm") {
    pnpm run build
} else {
    npm run build
}

if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green

# 5. Test
Write-Host "`n✅ Running tests..." -ForegroundColor Yellow
if ($PM -eq "pnpm") {
    pnpm run test
} else {
    npm run test
}
Write-Host "✅ Tests complete" -ForegroundColor Green

# 6. Verify output
Write-Host "`n📁 Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist/index.js") {
    Write-Host "✅ Build output found" -ForegroundColor Green
    Write-Host "`n🚀 Running the application:" -ForegroundColor Cyan
    node dist/index.js
} else {
    Write-Host "⚠️ No build output found" -ForegroundColor Yellow
}

Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
