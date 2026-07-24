import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STANDALONE_DIR = path.join(ROOT_DIR, 'dist-standalone');

console.log('========================================================');
console.log('Micro-Timegrapher Studio v1.0 Zero-Detection Builder');
console.log('========================================================');

console.log('Step 1: Building Vite production bundle for Micro-Timegrapher Studio...');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}
if (!fs.existsSync(STANDALONE_DIR)) {
  fs.mkdirSync(STANDALONE_DIR, { recursive: true });
}

console.log('Step 2: Bundling single-file HTML (start.html)...');
let htmlContent = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

// Inline CSS
htmlContent = htmlContent.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (match, href) => {
  const cssPath = path.join(DIST_DIR, href.startsWith('/') ? href.slice(1) : href);
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    return `<style>\n${cssContent}\n</style>`;
  }
  return match;
});

// Inline JS
htmlContent = htmlContent.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (match, src) => {
  const jsPath = path.join(DIST_DIR, src.startsWith('/') ? src.slice(1) : src);
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    return `<script type="module">\n${jsContent}\n</script>`;
  }
  return match;
});

const startHtmlPath = path.join(ROOT_DIR, 'start.html');
const standaloneHtmlPath = path.join(STANDALONE_DIR, 'index.html');
fs.writeFileSync(startHtmlPath, htmlContent, 'utf-8');
fs.writeFileSync(standaloneHtmlPath, htmlContent, 'utf-8');
console.log(`Standalone start.html created (${Math.round(htmlContent.length / 1024)} KB)`);

const base64Html = Buffer.from(htmlContent, 'utf-8').toString('base64');

console.log('Step 3: Compiling C# Native Studio App Launcher (Launcher.cs)...');
const csCode = `
using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;

class Program {
    [STAThread]
    static void Main() {
        try {
            string base64Data = "${base64Html}";
            byte[] htmlBytes = Convert.FromBase64String(base64Data);

            string tempDir = Path.Combine(Path.GetTempPath(), "MicroTimegrapherStudioProApp");
            if (!Directory.Exists(tempDir)) {
                Directory.CreateDirectory(tempDir);
            }

            string htmlFilePath = Path.Combine(tempDir, "index.html");
            File.WriteAllBytes(htmlFilePath, htmlBytes);

            string fileUri = "file:///" + htmlFilePath.Replace("\\\\", "/");
            string profileDir = Path.Combine(tempDir, "Profile");

            string[] possibleEdgePaths = new string[] {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                "msedge.exe"
            };

            string foundEdge = null;
            foreach (string p in possibleEdgePaths) {
                if (File.Exists(p) || p == "msedge.exe") {
                    foundEdge = p;
                    break;
                }
            }

            string[] possibleChromePaths = new string[] {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                "chrome.exe"
            };

            string foundChrome = null;
            foreach (string p in possibleChromePaths) {
                if (File.Exists(p) || p == "chrome.exe") {
                    foundChrome = p;
                    break;
                }
            }

            string browserPath = foundEdge ?? foundChrome;

            if (!string.IsNullOrEmpty(browserPath)) {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserPath;
                psi.Arguments = "--user-data-dir=\\"" + profileDir + "\\" --app=\\"" + fileUri + "\\" --window-size=1400,900 --allow-file-access-from-files";
                psi.UseShellExecute = true;

                try {
                    Process p = Process.Start(psi);
                    if (p != null) return;
                } catch {}
            }

            ProcessStartInfo fallbackPsi = new ProcessStartInfo();
            fallbackPsi.FileName = htmlFilePath;
            fallbackPsi.UseShellExecute = true;
            Process.Start(fallbackPsi);

        } catch (Exception ex) {
            MessageBox.Show("Micro-Timegrapher Studio Error: " + ex.Message, "Micro-Timegrapher Studio", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
`;

fs.writeFileSync(path.join(ROOT_DIR, 'Launcher.cs'), csCode, 'utf-8');

console.log('Step 4: Compiling MicroTimegrapherPro.exe...');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
if (fs.existsSync(cscPath)) {
  execSync(`"${cscPath}" /target:winexe /r:System.Windows.Forms.dll /out:MicroTimegrapherPro.exe Launcher.cs`, { stdio: 'inherit' });
  fs.copyFileSync('MicroTimegrapherPro.exe', path.join(DIST_DIR, 'MicroTimegrapherPro.exe'));
  fs.copyFileSync('MicroTimegrapherPro.exe', path.join(DIST_DIR, 'MicroTimegrapherPro-Setup-1.0.0.exe'));
  console.log('Successfully compiled MicroTimegrapherPro.exe!');
} else {
  console.error('csc.exe not found!');
}

console.log('Step 5: Packaging zip release file...');
execSync('Compress-Archive -Path start.html, run_app.bat, MicroTimegrapherPro.exe, README.md -DestinationPath Micro-Timegrapher-Pro-Windows.zip -Force', { shell: 'powershell.exe', stdio: 'inherit' });

console.log('Micro-Timegrapher Studio v1.0 Zero-Detection build completed successfully!');
