@echo off
echo Starting Micro-Timegrapher Studio v1.0 Zero-Detection App...

set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% set EDGE_PATH="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

set HTML_PATH="%~dp0start.html"

if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app="file:///%~dp0start.html" --window-size=1400,900 --user-data-dir="%TEMP%\MicroTimegrapherProfile"
) else if exist %CHROME_PATH% (
    start "" %CHROME_PATH% --app="file:///%~dp0start.html" --window-size=1400,900 --user-data-dir="%TEMP%\MicroTimegrapherProfile"
) else (
    start "" "%~dp0start.html"
)
