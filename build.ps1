Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Micro-Timegrapher Studio Pro MSVC Build Automation" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH += ";C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

node build-exe.js

if (Test-Path "H:\antigravity\dist\MicroTimegrapherPro.exe") {
    Write-Host "[SUCCESS] MicroTimegrapherPro.exe compiled successfully in H:\antigravity\dist\!" -ForegroundColor Green
} elseif (Test-Path "H:\antigravity\MicroTimegrapherPro.exe") {
    Write-Host "[SUCCESS] MicroTimegrapherPro.exe compiled successfully in H:\antigravity\!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
}
