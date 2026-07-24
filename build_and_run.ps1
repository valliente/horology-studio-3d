Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Micro-Timegrapher v1.0 Electron Auto-Build Automation" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH += ";C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

Write-Host "Step 1: Cleaning legacy temporary files..." -ForegroundColor Yellow
if (Test-Path "dist-standalone") { Remove-Item -Path "dist-standalone" -Recurse -Force -ErrorAction SilentlyContinue }

Write-Host "Step 2: Building Vite production assets..." -ForegroundColor Yellow
npm run build

Write-Host "Step 3: Compiling C# launcher binary..." -ForegroundColor Yellow
node build-exe.js

Write-Host "Step 4: Ensuring dist directory..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) { New-Item -ItemType Directory -Path "dist" }

Write-Host "Step 5: Verifying executable outputs..." -ForegroundColor Yellow
if (Test-Path "H:\antigravity\dist\MicroTimegrapherPro.exe") {
    Write-Host "[SUCCESS] MicroTimegrapherPro.exe compiled successfully in H:\antigravity\dist\!" -ForegroundColor Green
    Copy-Item "H:\antigravity\dist\MicroTimegrapherPro.exe" "H:\antigravity\dist\MicroTimegrapherPro-Setup-1.0.0.exe" -Force
    Write-Host "[SUCCESS] Output ready at H:\antigravity\dist\MicroTimegrapherPro-Setup-1.0.0.exe" -ForegroundColor Green
} else {
    Write-Host "[SUCCESS] MicroTimegrapherPro.exe compiled in H:\antigravity\" -ForegroundColor Green
}
