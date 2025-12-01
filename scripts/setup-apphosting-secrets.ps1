# PowerShell script to setup Firebase App Hosting secrets according to apphosting.yaml
# This script will:
# 1. Delete existing secrets (if they exist)
# 2. Create new secrets from .env.local
# 3. Grant access to the backend

param(
    [string]$Backend = "joystie-poc",
    [string]$EnvFile = ".env.local"
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

Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "Firebase App Hosting Secrets Setup"
Write-ColorOutput Green "=========================================="
Write-Output ""

# Check if .env.local exists
if (-not (Test-Path $EnvFile)) {
    Write-ColorOutput Red "Error: $EnvFile not found!"
    Write-Output "Please create $EnvFile with all required environment variables."
    exit 1
}

# Read .env.local
Write-Output "Reading $EnvFile..."
$envValues = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            $envValues[$key] = $value
        }
    }
}

Write-Output "Found $($envValues.Count) environment variables in $EnvFile"
Write-Output ""

# Define secrets from apphosting.yaml
$secrets = @(
    @{
        SecretName = "FIREBASE_API_KEY_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_API_KEY"
        Description = "Firebase API Key"
    },
    @{
        SecretName = "FIREBASE_AUTH_DOMAIN_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        Description = "Firebase Auth Domain"
    },
    @{
        SecretName = "FIREBASE_PROJECT_ID_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        Description = "Firebase Project ID"
    },
    @{
        SecretName = "FIREBASE_STORAGE_BUCKET_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        Description = "Firebase Storage Bucket"
    },
    @{
        SecretName = "FIREBASE_MESSAGING_SENDER_ID_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        Description = "Firebase Messaging Sender ID"
    },
    @{
        SecretName = "FIREBASE_APP_ID_INTGR_SECRET"
        EnvVar = "NEXT_PUBLIC_FIREBASE_APP_ID"
        Description = "Firebase App ID"
    },
    @{
        SecretName = "GOOGLE_API_KEY_INTGR_SECRET"
        EnvVar = "GOOGLE_API_KEY"
        Description = "Google Gemini API Key"
    },
    @{
        SecretName = "FIREBASE_FUNCTION_URL_INTGR_SECRET"
        EnvVar = "FIREBASE_FUNCTION_URL"
        Description = "Firebase Function URL"
    }
)

Write-ColorOutput Yellow "Creating/Updating secrets from $EnvFile..."
Write-Output ""

$successCount = 0
$failCount = 0

foreach ($secret in $secrets) {
    $secretName = $secret.SecretName
    $envVar = $secret.EnvVar
    $description = $secret.Description
    
    Write-Output ""
    Write-ColorOutput Cyan "Processing: $description"
    Write-Output "  Secret Name: $secretName"
    Write-Output "  Environment Variable: $envVar"
    
    # Get value from .env.local
    if (-not $envValues.ContainsKey($envVar)) {
        Write-ColorOutput Red "  ERROR: $envVar not found in $EnvFile"
        $failCount++
        continue
    }
    
    $value = $envValues[$envVar]
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-ColorOutput Red "  ERROR: $envVar is empty in $EnvFile"
        $failCount++
        continue
    }
    
    Write-Output "  Value found: [$($value.Length) characters]"
    
    # Set the secret
    Write-Output "  Setting secret..."
    try {
        # Create a temp file to avoid newline/backtick issues with PowerShell pipe
        $tempFile = Join-Path $env:TEMP "firebase-secret-$(New-Guid).txt"
        try {
            # Write value to temp file (UTF8 without BOM, no trailing newline or backtick)
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            # Remove any trailing backticks, newlines, or whitespace
            $cleanValue = $value.TrimEnd("`r", "`n", "`t", " ", "`")
            $bytes = $utf8NoBom.GetBytes($cleanValue)
            [System.IO.File]::WriteAllBytes($tempFile, $bytes)
            
            # Use type command to pipe file content to firebase (avoids PowerShell backtick issues)
            $typeCmd = "type `"$tempFile`""
            $firebaseCmd = "firebase apphosting:secrets:set $secretName"
            cmd /c "$typeCmd | $firebaseCmd"
        } finally {
            # Clean up temp file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
            }
        }
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "  Secret $secretName set successfully"
            
            # Grant access
            Write-Output "  Granting access to backend $Backend..."
            firebase apphosting:secrets:grantaccess $secretName --backend $Backend
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput Green "  Access granted successfully"
                $successCount++
            } else {
                Write-ColorOutput Red "  ERROR: Failed to grant access"
                $failCount++
            }
        } else {
            Write-ColorOutput Red "  ERROR: Failed to set secret (exit code: $LASTEXITCODE)"
            $failCount++
        }
    } catch {
        Write-ColorOutput Red "  ERROR: Exception occurred: $_"
        $failCount++
    }
}

Write-Output ""
Write-ColorOutput Green "=========================================="
Write-ColorOutput Green "Summary"
Write-ColorOutput Green "=========================================="
Write-Output "Successfully configured: $successCount"
Write-Output "Failed: $failCount"
Write-Output ""

if ($failCount -eq 0) {
    Write-ColorOutput Green "All secrets configured successfully!"
    Write-Output ""
    Write-Output "Next steps:"
    Write-Output "1. Verify secrets are set: firebase apphosting:secrets:list"
    Write-Output "2. Deploy your app: git push (will trigger automatic deployment)"
} else {
    Write-ColorOutput Red "Some secrets failed to configure. Please check the errors above."
    exit 1
}

