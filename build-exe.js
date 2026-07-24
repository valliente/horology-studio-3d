import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STANDALONE_DIR = path.join(ROOT_DIR, 'dist-standalone');

console.log('Step 1: Running Vite build...');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync(STANDALONE_DIR)) {
  fs.mkdirSync(STANDALONE_DIR, { recursive: true });
}

console.log('Step 2: Bundling single-file HTML...');
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

const standaloneHtmlPath = path.join(STANDALONE_DIR, 'index.html');
fs.writeFileSync(standaloneHtmlPath, htmlContent, 'utf-8');
console.log(`Standalone HTML created (${Math.round(htmlContent.length / 1024)} KB)`);

// Convert HTML to Base64 to safely embed into C# code without string escape errors
const base64Html = Buffer.from(htmlContent, 'utf-8').toString('base64');

console.log('Step 3: Creating self-contained C# Launcher source (Launcher.cs)...');
const csCode = `
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Diagnostics;
using System.Threading;

class Program {
    static HttpListener listener;
    static byte[] htmlBytes;

    [STAThread]
    static void Main() {
        string base64Data = "${base64Html}";
        htmlBytes = Convert.FromBase64String(base64Data);

        int port = 42425;
        bool started = false;

        while (port < 42500 && !started) {
            try {
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Start();
                started = true;
            } catch {
                port++;
            }
        }

        if (!started) {
            return;
        }

        Thread serverThread = new Thread(() => {
            while (listener.IsListening) {
                try {
                    var context = listener.GetContext();
                    context.Response.ContentType = "text/html; charset=utf-8";
                    context.Response.ContentLength64 = htmlBytes.Length;
                    context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                    context.Response.OutputStream.Write(htmlBytes, 0, htmlBytes.Length);
                    context.Response.OutputStream.Close();
                } catch {}
            }
        });
        serverThread.IsBackground = true;
        serverThread.Start();

        string appUrl = "http://127.0.0.1:" + port + "/";

        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = "msedge.exe";
        psi.Arguments = "--app=" + appUrl + " --window-size=1280,800";
        psi.UseShellExecute = true;

        try {
            Process.Start(psi);
        } catch {
            try {
                psi.FileName = "cmd.exe";
                psi.Arguments = "/c start " + appUrl;
                Process.Start(psi);
            } catch {
                Process.Start(appUrl);
            }
        }
    }
}
`;

fs.writeFileSync(path.join(ROOT_DIR, 'Launcher.cs'), csCode, 'utf-8');

console.log('Step 4: Compiling self-contained MicroTimegrapher.exe...');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
if (fs.existsSync(cscPath)) {
  execSync(`"${cscPath}" /target:winexe /out:MicroTimegrapher.exe Launcher.cs`, { stdio: 'inherit' });
  console.log('Successfully compiled MicroTimegrapher.exe!');
} else {
  console.error('csc.exe not found!');
}

console.log('Step 5: Packaging zip release file...');
execSync('Compress-Archive -Path MicroTimegrapher.exe, README.md -DestinationPath Micro-Timegrapher-Windows.zip -Force', { shell: 'powershell.exe', stdio: 'inherit' });

console.log('Build process completed successfully!');
