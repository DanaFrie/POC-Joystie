# PowerShell script to delete all Firebase App Hosting secrets
# This will remove all versions of the secrets

param(
    [switch]$Force = $false
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Red "=========================================="
Write-ColorOutput Red "Delete Firebase App Hosting Secrets"
Write-ColorOutput Red "=========================================="
Write-Output ""
Write-ColorOutput Yellow "WARNING: This will permanently delete all secrets!"
Write-Output ""

if (-not $Force) {
    $confirm = Read-Host "Are you sure you want to delete all secrets? Type 'yes' to confirm"
    if ($confirm -ne "yes") {
        Write-Output "Cancelled."
        exit 0
    }
}

# Define secrets from apphosting.yaml
$secrets = @(
    "FIREBASE_API_KEY_INTGR_SECRET",
    "FIREBASE_AUTH_DOMAIN_INTGR_SECRET",
    "FIREBASE_PROJECT_ID_INTGR_SECRET",
    "FIREBASE_STORAGE_BUCKET_INTGR_SECRET",
    "FIREBASE_MESSAGING_SENDER_ID_INTGR_SECRET",
    "FIREBASE_APP_ID_INTGR_SECRET",
    "GOOGLE_API_KEY_INTGR_SECRET",
    "FIREBASE_FUNCTION_URL_INTGR_SECRET"
)

Write-ColorOutput Yellow "Deleting secrets..."
Write-Output ""

$successCount = 0
$failCount = 0

foreach ($secretName in $secrets) {
    Write-Output "Deleting: $secretName"
    
    try {
        # Check if secret exists first
        $checkResult = firebase apphosting:secrets:access $secretName 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Secret exists, delete it using gcloud (Firebase CLI doesn't have delete command)
            # Get project ID from firebase
            $projectId = firebase projects:list --json | ConvertFrom-Json | Where-Object { $_.active } | Select-Object -First 1 -ExpandProperty projectId
            
            if ($projectId) {
                Write-Output "  Using gcloud to delete secret in project: $projectId"
                
                # Delete all versions of the secret
                $deleteResult = gcloud secrets delete $secretName --project=$projectId --quiet 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput Green "  Secret $secretName deleted successfully"
                    $successCount++
                } else {
                    Write-ColorOutput Red "  ERROR: Failed to delete secret (exit code: $LASTEXITCODE)"
                    Write-Output "  Error: $deleteResult"
                    $failCount++
                }
            } else {
                Write-ColorOutput Red "  ERROR: Could not determine Firebase project ID"
                Write-Output "  Trying alternative method..."
                
                # Alternative: Try to delete using gcloud without project (uses default)
                $deleteResult = gcloud secrets delete $secretName --quiet 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput Green "  Secret $secretName deleted successfully"
                    $successCount++
                } else {
                    Write-ColorOutput Red "  ERROR: Failed to delete secret"
                    Write-Output "  Error: $deleteResult"
                    $failCount++
                }
            }
        } else {
            Write-Output "  Secret $secretName does not exist (skipping)"
        }
    } catch {
        Write-ColorOutput Red "  ERROR: Exception occurred: $_"
        $failCount++
    }
    Write-Output ""
}

Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "Summary"
Write-ColorOutput Green "=========================================="
Write-Output "Successfully deleted: $successCount"
Write-Output "Failed: $failCount"
Write-Output ""

if ($failCount -eq 0) {
    Write-ColorOutput Green "All secrets deleted successfully!"
    Write-Output ""
    Write-Output "You can now run: .\scripts\setup-apphosting-secrets.ps1"
    Write-Output "to create fresh secrets without old versions."
} else {
    Write-ColorOutput Yellow "Some secrets failed to delete."
    Write-Output "You may need to delete them manually from Google Cloud Console:"
    Write-Output "https://console.cloud.google.com/security/secret-manager"
}

