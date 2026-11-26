$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null

function Pack-Extension($folder, $zipName) {
    $source = Join-Path $root $folder
    $zip = Join-Path $dist $zipName
    if (Test-Path $zip) { Remove-Item $zip }
    Push-Location $source
    try {
        tar -a -cf $zip *
    } finally {
        Pop-Location
    }
}

Pack-Extension "chrome" "youtube-clean-chrome.zip"
Pack-Extension "firefox" "youtube-clean-firefox.zip"
Write-Host "Paquetes en $dist"
