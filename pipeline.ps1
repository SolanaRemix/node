# pipeline.ps1 - Unified Build & Deployment Pipeline
param([switch]$Clean, [switch]$SkipBuild, [switch]$SkipServer)

Write-Host "🚀 ATOMIC SWARM GODS v1.6.0 - DEPLOYMENT PIPELINE" -ForegroundColor Cyan

if ($Clean) {
    Write-Host "🧹 Cleaning artifacts..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules, dist, package-lock.json -ErrorAction SilentlyContinue
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if (-not $SkipBuild) {
    Write-Host "🔨 Building project..." -ForegroundColor Yellow
    npm run build
}

Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm test

if (-not $SkipServer) {
    Write-Host "🏥 Starting Surgery Server..." -ForegroundColor Green
    Start-Process "http://localhost:3001"
    node server.js
}
