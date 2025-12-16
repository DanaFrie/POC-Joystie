# PowerShell script to deploy Firebase Functions for PRODUCTION
# Usage: .\scripts\deploy-functions-prod.ps1

Write-Host "🚀 Deploying Firebase Functions for PRODUCTION..." -ForegroundColor Cyan
Write-Host ""

# Switch to prod project
Write-Host "Switching to prod Firebase project..." -ForegroundColor Yellow
firebase use prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to switch to prod project" -ForegroundColor Red
    exit 1
}

# Navigate to functions directory
$originalDir = Get-Location
Set-Location functions

try {
    # Build functions
    Write-Host "🔨 Building functions..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    
    # Deploy functions
    Write-Host ""
    Write-Host "📦 Deploying functions..." -ForegroundColor Yellow
    Set-Location $originalDir
    firebase deploy --only functions --config firebase.prod.json
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Functions deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Verify in Firebase Console:" -ForegroundColor Cyan
    Write-Host "   https://console.firebase.google.com/project/joystie-poc-prod/functions" -ForegroundColor Gray
    
} finally {
    Set-Location $originalDir
}

