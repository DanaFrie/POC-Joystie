# PowerShell script to sync configuration files based on git branch
# This script detects the current branch and copies the appropriate config files
# Usage: .\scripts\sync-branch-config.ps1

param(
    [string]$Branch = ""
)

# If branch not provided, detect from git
if ([string]::IsNullOrWhiteSpace($Branch)) {
    try {
        $Branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Warning: Could not detect git branch, defaulting to intgr" -ForegroundColor Yellow
            $Branch = "intgr"
        }
    } catch {
        Write-Host "Warning: Could not detect git branch, defaulting to intgr" -ForegroundColor Yellow
        $Branch = "intgr"
    }
}

Write-Host "Current branch: $Branch" -ForegroundColor Cyan
Write-Host ""

# Determine environment
$env = ""
if ($Branch -eq "main" -or $Branch -eq "master") {
    $env = "prod"
} else {
    $env = "intgr"
}

Write-Host "Environment: $env" -ForegroundColor Cyan
Write-Host ""

# Configuration file mappings
# Format: @{ SourceFile = "source"; TargetFile = "target"; Description = "description" }
$configMappings = @(
    @{
        SourceFile = if ($env -eq "prod") { "apphosting.prod.yaml" } else { "apphosting.yaml" }
        TargetFile = "apphosting.yaml"
        Description = "Firebase App Hosting configuration"
    }
    # Add more file mappings here as needed
    # Example:
    # @{
    #     SourceFile = if ($env -eq "prod") { "firebase.prod.json" } else { "firebase.json" }
    #     TargetFile = "firebase.json"
    #     Description = "Firebase configuration"
    # }
)

$successCount = 0
$errorCount = 0

foreach ($mapping in $configMappings) {
    $sourceFile = $mapping.SourceFile
    $targetFile = $mapping.TargetFile
    $description = $mapping.Description
    
    Write-Host "Syncing $description..." -ForegroundColor Yellow
    Write-Host "  Source: $sourceFile" -ForegroundColor Gray
    Write-Host "  Target: $targetFile" -ForegroundColor Gray
    
    # Skip if source and target are the same (Intgr branch case)
    if ($sourceFile -eq $targetFile) {
        Write-Host "  Skipping: Source and target are the same (already correct)" -ForegroundColor Green
        $successCount++
        Write-Host ""
        continue
    }
    
    # Check if source file exists
    if (-not (Test-Path $sourceFile)) {
        Write-Host "  Error: Source file not found: $sourceFile" -ForegroundColor Red
        Write-Host "  Make sure you're on the correct branch:" -ForegroundColor Yellow
        if ($env -eq "prod") {
            Write-Host "    - main branch should have $sourceFile" -ForegroundColor Gray
        } else {
            Write-Host "    - Intgr branch should have $sourceFile" -ForegroundColor Gray
        }
        $errorCount++
        continue
    }
    
    # Copy file
    try {
        Copy-Item $sourceFile -Destination $targetFile -Force
        Write-Host "  Success: Copied $sourceFile -> $targetFile" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  Error: Failed to copy $sourceFile -> $targetFile" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    Write-Host ""
}

# Summary
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successfully synced: $successCount files" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errors: $errorCount files" -ForegroundColor Red
    exit 1
}

# Set environment variable for use in other scripts
$env:BRANCH_ENV = $env
Write-Host "Environment variable set: BRANCH_ENV=$env" -ForegroundColor Gray

