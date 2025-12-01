# PowerShell script to sync Firebase App Hosting secrets to .env.local
# This allows local development to use the same secrets as App Hosting

param(
    [string]$EnvFile = ".env.local",
    [switch]$Backup = $false
)

# Colors for output
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$ForegroundColor,
        [Parameter(Mandatory=$true, Position=1)]
        [string]$Message
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

Write-ColorOutput "Green" "=========================================="
Write-ColorOutput "Green" "Sync Firebase Secrets to .env.local"
Write-ColorOutput "Green" "=========================================="
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

# Backup existing .env.local if it exists (only one backup, overwrite if exists)
if ($Backup -and (Test-Path $EnvFile)) {
    $backupFile = "$EnvFile.backup"
    Write-Output "Backing up existing $EnvFile to $backupFile..."
    Copy-Item $EnvFile $backupFile -Force
    Write-ColorOutput "Green" "Backup created: $backupFile"
    Write-Output ""
}

# Read existing .env.local to preserve other variables
$existingEnv = @{}
if (Test-Path $EnvFile) {
    Write-Output "Reading existing $EnvFile..."
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim().Trim('"').Trim("'")
                $existingEnv[$key] = $value
            }
        }
    }
}

Write-Output ""
Write-ColorOutput "Yellow" "Fetching secrets from Firebase Secret Manager..."
Write-Output ""

$successCount = 0
$failCount = 0
$newEnv = @{}

# Fetch secrets and update .env.local
foreach ($secret in $secrets) {
    $secretName = $secret.SecretName
    $envVar = $secret.EnvVar
    $description = $secret.Description
    
    Write-Output "Fetching: $description"
    Write-Output "  Secret: $secretName"
    Write-Output "  Variable: $envVar"
    
    try {
        # Get secret value from Firebase
        $secretValue = firebase apphosting:secrets:access $secretName 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Remove any trailing newlines/whitespace/backticks
            $secretValue = $secretValue.TrimEnd("`r", "`n", "`t", " ", "`").Trim()
            
            if ([string]::IsNullOrWhiteSpace($secretValue)) {
                Write-ColorOutput "Red" "  ERROR: Secret is empty"
                $failCount++
                # Keep existing value if available
                if ($existingEnv.ContainsKey($envVar)) {
                    $newEnv[$envVar] = $existingEnv[$envVar]
                    Write-Output "  Keeping existing value from .env.local"
                }
            } else {
                $newEnv[$envVar] = $secretValue
                Write-ColorOutput "Green" "  Successfully fetched [$($secretValue.Length) characters]"
                $successCount++
            }
        } else {
            Write-ColorOutput "Red" "  ERROR: Failed to fetch secret (exit code: $LASTEXITCODE)"
            $failCount++
            # Keep existing value if available
            if ($existingEnv.ContainsKey($envVar)) {
                $newEnv[$envVar] = $existingEnv[$envVar]
                Write-Output "  Keeping existing value from .env.local"
            }
        }
    } catch {
        Write-ColorOutput "Red" "  ERROR: Exception occurred: $_"
        $failCount++
        # Keep existing value if available
        if ($existingEnv.ContainsKey($envVar)) {
            $newEnv[$envVar] = $existingEnv[$envVar]
            Write-Output "  Keeping existing value from .env.local"
        }
    }
    Write-Output ""
}

# Preserve other variables from existing .env.local
foreach ($key in $existingEnv.Keys) {
    if (-not $newEnv.ContainsKey($key)) {
        $newEnv[$key] = $existingEnv[$key]
    }
}

# Write new .env.local
Write-ColorOutput "Yellow" "Writing $EnvFile..."
$envLines = @()
$envLines += "# Environment variables synced from Firebase Secret Manager"
$envLines += "# Auto-generated - do not edit manually"
$envLines += "# Run: npm run sync-secrets to update from Firebase Secret Manager"
$envLines += "# Last synced: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$envLines += ""

# Add synced secrets first
foreach ($secret in $secrets) {
    $envVar = $secret.EnvVar
    if ($newEnv.ContainsKey($envVar)) {
        $value = $newEnv[$envVar]
        $envLines += "$envVar=$value"
    }
}

$envLines += ""

# Add other variables
$otherVars = $newEnv.Keys | Where-Object { 
    $key = $_
    -not ($secrets | Where-Object { $_.EnvVar -eq $key })
}
if ($otherVars.Count -gt 0) {
    $envLines += "# Other environment variables"
    foreach ($key in $otherVars | Sort-Object) {
        $value = $newEnv[$key]
        $envLines += "$key=$value"
    }
}

# Write to file (join lines with newlines, no backticks)
$content = $envLines -join [Environment]::NewLine
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($EnvFile, $content, $utf8NoBom)

Write-ColorOutput "Green" "$EnvFile updated successfully!"
Write-Output ""

Write-ColorOutput "Green" "=========================================="
Write-ColorOutput "Green" "Summary"
Write-ColorOutput "Green" "=========================================="
Write-Output "Successfully synced: $successCount"
Write-Output "Failed: $failCount"
Write-Output ""

if ($failCount -eq 0) {
    Write-ColorOutput "Green" "All secrets synced successfully!"
    Write-Output ""
    Write-Output "You can now run: npm run dev"
    Write-Output "Local development will use the same secrets as App Hosting."
} else {
    Write-ColorOutput "Yellow" "Some secrets failed to sync. Using existing values from .env.local where available."
    Write-Output ""
    Write-Output "You can still run: npm run dev"
    Write-Output "But some values might be outdated."
}

