# Test script for testEmailNotification function
# Usage: .\test-email-function.ps1

$uri = "https://us-central1-joystie-poc.cloudfunctions.net/testEmailNotification"
$body = @{
    data = @{}
} | ConvertTo-Json

Write-Host "🚀 Testing Firebase Function: testEmailNotification" -ForegroundColor Cyan
Write-Host "📧 Sending request to: $uri" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

