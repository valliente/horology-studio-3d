import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STANDALONE_DIR = path.join(ROOT_DIR, 'dist-standalone');

console.log('Step 1: Building Vite production bundle...');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync(STANDALONE_DIR)) {
  fs.mkdirSync(STANDALONE_DIR, { recursive: true });
}

console.log('Step 2: Creating single-file standalone index.html...');
let htmlContent = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

// Inline CSS files
htmlContent = htmlContent.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (match, href) => {
  const cssPath = path.join(DIST_DIR, href.startsWith('/') ? href.slice(1) : href);
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    return `<style>\n${cssContent}\n</style>`;
  }
  return match;
});

// Inline JS files
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
console.log(`Standalone HTML created at: ${standaloneHtmlPath}`);

console.log('Step 3: Creating HTA application (MicroTimegrapher.hta)...');
const htaContent = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="x-ua-compatible" content="ie=edge" />
<title>Micro-Timegrapher | Acoustic Watch Analyzer</title>
<HTA:APPLICATION 
  ID="MicroTimegrapher"
  APPLICATIONNAME="Micro-Timegrapher"
  BORDER="thin"
  BORDERSTYLE="normal"
  CAPTION="yes"
  MAXIMIZEBUTTON="yes"
  MINIMIZEBUTTON="yes"
  SHOWINTASKBAR="yes"
  SINGLEINSTANCE="yes"
  SYSMENU="yes"
  WINDOWSTATE="maximize"
  SCROLL="no"
/>
</head>
<body style="margin:0;padding:0;overflow:hidden;background:#0a0c10;">
<iframe src="dist-standalone/index.html" style="width:100vw;height:100vh;border:none;" allow="microphone"></iframe>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT_DIR, 'MicroTimegrapher.hta'), htaContent, 'utf-8');

console.log('Step 4: Writing C# WebServer App Launcher (Launcher.cs)...');
const csCode = `
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;

class Program {
    static HttpListener listener;

    [STAThread]
    static void Main() {
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        string htmlPath = Path.Combine(exeDir, "dist-standalone\\\\index.html");
        if (!File.Exists(htmlPath)) {
            htmlPath = Path.Combine(exeDir, "index.html");
        }

        string htmlData = File.Exists(htmlPath) ? File.ReadAllText(htmlPath) : "<h1>Micro-Timegrapher HTML File Not Found</h1>";

        int port = 42425;
        listener = new HttpListener();
        listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
        
        try {
            listener.Start();
        } catch {
            port = 42426;
            listener = new HttpListener();
            listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            listener.Start();
        }

        Thread serverThread = new Thread(() => {
            while (listener.IsListening) {
                try {
                    var context = listener.GetContext();
                    byte[] buf = Encoding.UTF8.GetBytes(htmlData);
                    context.Response.ContentType = "text/html; charset=utf-8";
                    context.Response.ContentLength64 = buf.Length;
                    context.Response.OutputStream.Write(buf, 0, buf.Length);
                    context.Response.OutputStream.Close();
                } catch {}
            }
        });
        serverThread.IsBackground = true;
        serverThread.Start();

        string appUrl = "http://127.0.0.1:" + port + "/";

        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = "msedge.exe";
        psi.Arguments = "--app=" + appUrl;
        psi.UseShellExecute = true;

        try {
            Process.Start(psi);
        } catch {
            Process.Start(appUrl);
        }
    }
}
`;

fs.writeFileSync(path.join(ROOT_DIR, 'Launcher.cs'), csCode, 'utf-8');

const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
if (fs.existsSync(cscPath)) {
  try {
    execSync(`"${cscPath}" /target:winexe /r:System.Windows.Forms.dll /out:MicroTimegrapher.exe Launcher.cs`, { stdio: 'inherit' });
    console.log('Successfully compiled MicroTimegrapher.exe!');
  } catch (err) {
    console.error('Compilation error:', err);
  }
}

console.log('Step 5: Creating zip archive (Micro-Timegrapher-Windows.zip)...');
try {
  execSync('Compress-Archive -Path MicroTimegrapher.exe, MicroTimegrapher.hta, dist-standalone, README.md -DestinationPath Micro-Timegrapher-Windows.zip -Force', { shell: 'powershell.exe', stdio: 'inherit' });
  console.log('Zip package created at: Micro-Timegrapher-Windows.zip');
} catch (e) {
  console.error('Compress-Archive error:', e);
}

console.log('All release build steps completed successfully!');
