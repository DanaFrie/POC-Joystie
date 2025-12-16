# PowerShell script to deploy Cloud Run service for INTEGRATION
# Usage: .\scripts\deploy-cloud-run-intgr.ps1

param(
    [string]$ServiceName = "process-screenshot-intgr",
    [string]$Region = "us-central1",
    [string]$Memory = "1Gi",
    [switch]$SkipBuild
)

Write-Host "🚀 Deploying Cloud Run service for INTEGRATION..." -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
$gcloudCheck = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudCheck) {
    Write-Host "❌ Error: gcloud CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Get Google API Key from user
Write-Host "🔑 Enter Google API Key (for Gemini):" -ForegroundColor Yellow
$apiKey = Read-Host -AsSecureString
$apiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
)

if ([string]::IsNullOrWhiteSpace($apiKeyPlain)) {
    Write-Host "❌ Error: API Key is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Building and deploying service: $ServiceName" -ForegroundColor Cyan
Write-Host "   Region: $Region" -ForegroundColor Gray
Write-Host "   Memory: $Memory" -ForegroundColor Gray
Write-Host ""

# Build and deploy
$deployCommand = "gcloud run deploy $ServiceName " +
    "--source . " +
    "--platform managed " +
    "--region $Region " +
    "--allow-unauthenticated " +
    "--memory $Memory " +
    "--set-env-vars GOOGLE_API_KEY=$apiKeyPlain"

if ($SkipBuild) {
    Write-Host "⏭️  Skipping build (using existing image)" -ForegroundColor Yellow
} else {
    Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Executing: gcloud run deploy..." -ForegroundColor Gray
Invoke-Expression $deployCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Get the service URL
Write-Host ""
Write-Host "📡 Getting service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"

if ($LASTEXITCODE -eq 0 -and $serviceUrl) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Update Firebase Functions secret (נפרד מ-App Hosting):" -ForegroundColor Gray
    Write-Host "     firebase use intgr" -ForegroundColor White
    Write-Host "     firebase functions:secrets:set FIREBASE_FUNCTION_URL" -ForegroundColor White
    Write-Host "     (Enter: $serviceUrl)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Update App Hosting secret (נפרד מ-Functions):" -ForegroundColor Gray
    Write-Host "     firebase apphosting:secrets:set FIREBASE_FUNCTION_URL_INTGR_SECRET" -ForegroundColor White
    Write-Host "     (Enter: $serviceUrl)" -ForegroundColor Gray
    Write-Host "     firebase apphosting:secrets:grantaccess FIREBASE_FUNCTION_URL_INTGR_SECRET --backend joystie-poc" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Test the service:" -ForegroundColor Gray
    Write-Host "     curl $serviceUrl/health" -ForegroundColor White
} else {
    Write-Host "⚠️  Could not retrieve service URL. Check manually in Cloud Console." -ForegroundColor Yellow
}

