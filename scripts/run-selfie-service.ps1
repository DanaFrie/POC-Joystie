# Local selfie blending service (uvicorn --reload).
# SELFIE_SERVICE_SCRIPT_V2
# Usage (repo root):
#   PowerShell:  $env:GOOGLE_API_KEY = "your-key"
#   cmd.exe:     set GOOGLE_API_KEY=your-key
#   then:        npm run selfie:service
#
# Then in .env.local:
#   NEXT_PUBLIC_SELFIE_SERVICE_URL=http://127.0.0.1:8081

param(
  [int]$Port = 8081,
  [string]$ApiKey = $env:GOOGLE_API_KEY
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$ServiceDir = Join-Path $RepoRoot "cloud-run\selfie"
$VenvDir = Join-Path $ServiceDir ".venv"
$BgAsset = Join-Path $RepoRoot "public\onboarding\child\castle-dori-selfie.webp"
$RequirementsDocker = Join-Path $ServiceDir "requirements.txt"
$RequirementsLocal = Join-Path $ServiceDir "requirements-local.txt"

function Get-PythonInfo([string]$Exe, [string[]]$PrefixArgs = @()) {
  try {
    $out = & $Exe @PrefixArgs -c "import sys,struct; print(sys.executable); print(f'{sys.version_info.major}.{sys.version_info.minor}'); print(8*struct.calcsize('P'))" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $out) { return $null }
    $lines = @($out | ForEach-Object { "$_".Trim() } | Where-Object { $_ })
    if ($lines.Count -lt 3) { return $null }
    return @{
      Exe = $lines[0]
      Version = $lines[1]
      Bits = [int]$lines[2]
    }
  } catch {
    return $null
  }
}

function Resolve-PythonHost {
  $candidates = @()
  $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
  if ($pyLauncher) {
    # Prefer 64-bit interpreters with binary wheels for Pillow / pydantic.
    foreach ($args in @(
        @("-3.14"),
        @("-3.13"),
        @("-3.12"),
        @("-3.11"),
        @("-3.14-64"),
        @("-3.13-64"),
        @("-3.12-64"),
        @("-3.11-64")
      )) {
      $info = Get-PythonInfo "py" $args
      if ($info -and $info.Bits -eq 64) {
        $candidates += $info
      }
    }
  }

  foreach ($name in @("python3.14", "python3.13", "python3.12", "python3.11", "python")) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if (-not $cmd) { continue }
    $info = Get-PythonInfo $cmd.Source
    if ($info -and $info.Bits -eq 64) {
      $candidates += $info
    }
  }

  $unique = @()
  $seen = @{}
  foreach ($c in $candidates) {
    if ($seen.ContainsKey($c.Exe)) { continue }
    $seen[$c.Exe] = $true
    $unique += $c
  }
  if ($unique.Count -eq 0) { return $null }
  return $unique[0]
}

if (-not (Test-Path $BgAsset)) {
  Write-Error "Background asset missing: $BgAsset"
}

if (-not $ApiKey) {
  Write-Host ""
  Write-Host "GOOGLE_API_KEY is not set." -ForegroundColor Yellow
  Write-Host "  PowerShell:  `$env:GOOGLE_API_KEY = 'your-gemini-key'"
  Write-Host "  cmd.exe:     set GOOGLE_API_KEY=your-gemini-key"
  Write-Host "  then:        npm run selfie:service"
  Write-Host ""
  exit 1
}

$hostPy = Resolve-PythonHost
if (-not $hostPy) {
  Write-Host ""
  Write-Host "Need a 64-bit Python 3.11+ (32-bit / source builds fail on Windows)." -ForegroundColor Red
  Write-Host "Install 64-bit from https://www.python.org/downloads/ then run: py -0p"
  Write-Host ""
  exit 1
}

$useLocalReqs = Test-Path $RequirementsLocal
$Requirements = if ($useLocalReqs) { $RequirementsLocal } else { $RequirementsDocker }

Write-Host "Using Python $($hostPy.Version) ($($hostPy.Bits)-bit) -> $($hostPy.Exe)"
Write-Host "Requirements -> $(Split-Path -Leaf $Requirements)"

$needRecreate = $false
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
  $needRecreate = $true
} else {
  $venvInfo = Get-PythonInfo $VenvPython
  if (-not $venvInfo -or $venvInfo.Version -ne $hostPy.Version -or $venvInfo.Bits -ne $hostPy.Bits) {
    Write-Host "Existing venv mismatch - recreating..." -ForegroundColor Yellow
    $needRecreate = $true
  }
}

if ($needRecreate) {
  if (Test-Path $VenvDir) {
    Remove-Item -Recurse -Force $VenvDir
  }
  Write-Host "Creating venv at $VenvDir ..."
  & $hostPy.Exe -m venv $VenvDir
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create venv with $($hostPy.Exe)"
  }
}

$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
  Write-Error "venv python missing at $VenvPython"
}

Write-Host "Installing / updating requirements..."
& $VenvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $VenvPython -m pip install -r $Requirements
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "pip install failed. Fix deps, then retry npm run selfie:service" -ForegroundColor Red
  exit $LASTEXITCODE
}

$env:GOOGLE_API_KEY = $ApiKey
$env:BACKGROUND_IMAGE_PATH = $BgAsset
$env:PORT = "$Port"
$env:CORS_ALLOW_ORIGINS = "*"

Write-Host ""
Write-Host "Selfie service -> http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "  health:  GET  http://127.0.0.1:$Port/health"
Write-Host "  generate: POST http://127.0.0.1:$Port/generate-selfie-json"
Write-Host "  bg: $BgAsset"
Write-Host "  reload: on (edit cloud-run/selfie/main.py)"
Write-Host ""
Write-Host "UI: NEXT_PUBLIC_SELFIE_SERVICE_URL=http://127.0.0.1:$Port in .env.local"
Write-Host "    npm run dev -> /onboarding/child/selfie-generate-test"
Write-Host ""

Set-Location $ServiceDir
& $VenvPython -m uvicorn main:app --host 127.0.0.1 --port $Port --reload
