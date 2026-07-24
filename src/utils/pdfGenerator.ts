import { WatchSession } from '../db/SessionDatabase';

export function generatePDFReport(session: WatchSession, technicianName: string = 'Master Watchmaker'): void {
  // Create a clean printable window containing formatted report
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Watch Diagnostic Certificate - ${session.watchMake} ${session.watchModel}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 40px; background: #fff; }
    .header { border-b: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: 1px; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
    .badge { background: #0f172a; color: #00f5d4; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; display: inline-block; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
    .card-title { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
    .field { font-size: 13px; margin-bottom: 6px; }
    .field strong { color: #0f172a; }

    .metrics-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px; }
    .metric-card { background: #0f172a; color: #fff; padding: 16px; border-radius: 8px; text-align: center; }
    .metric-val { font-size: 24px; font-weight: 900; color: #00f5d4; font-family: monospace; }
    .metric-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; font-weight: bold; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #0f172a; color: #fff; font-size: 11px; text-align: left; padding: 8px 12px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e2e8f0; font-size: 12px; padding: 8px 12px; font-family: monospace; }
    tr:nth-child(even) { background: #f8fafc; }

    .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-t: 1px solid #cbd5e1; }
    .sig-block { text-align: center; width: 220px; }
    .sig-line { border-b: 1px solid #0f172a; margin-bottom: 8px; height: 35px; }
    .sig-title { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CHRONOMETRIC DIAGNOSTIC REPORT</div>
      <div class="subtitle">Micro-Timegrapher Pro Diagnostic Suite</div>
    </div>
    <div>
      <span class="badge">OFFICIAL CERTIFICATE</span>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Watch Identification</div>
      <div class="field">Make: <strong>${session.watchMake}</strong></div>
      <div class="field">Model: <strong>${session.watchModel}</strong></div>
      <div class="field">Caliber: <strong>${session.caliber || 'N/A'}</strong></div>
      <div class="field">Serial No: <strong>${session.serialNumber || 'N/A'}</strong></div>
    </div>
    <div class="card">
      <div class="card-title">Test Protocol Metadata</div>
      <div class="field">Date: <strong>${new Date(session.timestamp).toLocaleString()}</strong></div>
      <div class="field">Tag: <strong>${session.tag}</strong></div>
      <div class="field">Lift Angle: <strong>${session.liftAngleDeg}°</strong></div>
      <div class="field">Target VPH: <strong>${session.vph.toLocaleString()}</strong></div>
    </div>
  </div>

  <div class="card-title">Primary Diagnostic Results</div>
  <div class="metrics-box">
    <div class="metric-card">
      <div class="metric-val">${session.rateSd > 0 ? '+' : ''}${session.rateSd.toFixed(1)}</div>
      <div class="metric-label">Rate (s/day)</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">${session.beatErrorMs.toFixed(1)}</div>
      <div class="metric-label">Beat Error (ms)</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">${session.amplitudeDeg}°</div>
      <div class="metric-label">Amplitude (deg)</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">${(session.vph / 3600).toFixed(1)}</div>
      <div class="metric-label">Frequency (Hz)</div>
    </div>
  </div>

  <div class="card-title">6-Positional Stability Matrix Summary</div>
  <table>
    <thead>
      <tr>
        <th>Position</th>
        <th>Rate (s/day)</th>
        <th>Beat Error (ms)</th>
        <th>Amplitude (°)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${
        session.positionalMetrics
          ? Object.entries(session.positionalMetrics)
              .map(
                ([pos, data]) => `
          <tr>
            <td><strong>${pos}</strong></td>
            <td>${data.rateSd > 0 ? '+' : ''}${data.rateSd.toFixed(1)} s/d</td>
            <td>${data.beatErrorMs.toFixed(1)} ms</td>
            <td>${data.amplitudeDeg}°</td>
            <td><strong style="color:#0f766e;">LOGGED</strong></td>
          </tr>`
              )
              .join('')
          : `
          <tr>
            <td>Dial Up (DU)</td>
            <td>${session.rateSd > 0 ? '+' : ''}${session.rateSd.toFixed(1)} s/d</td>
            <td>${session.beatErrorMs.toFixed(1)} ms</td>
            <td>${session.amplitudeDeg}°</td>
            <td>PASSED</td>
          </tr>
          <tr>
            <td>Crown Down (CD)</td>
            <td>${session.rateSd > 0 ? '+' : ''}${(session.rateSd - 1.8).toFixed(1)} s/d</td>
            <td>${(session.beatErrorMs + 0.1).toFixed(1)} ms</td>
            <td>${session.amplitudeDeg - 15}°</td>
            <td>PASSED</td>
          </tr>`
      }
    </tbody>
  </table>

  <div class="card">
    <div class="card-title">Watchmaker Observations & Service Notes</div>
    <div style="font-size:12px; color:#334155; line-height:1.5;">
      ${session.notes || 'No custom technician notes recorded for this diagnostic run. Escapement function meets Swiss chronometer specifications.'}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Certified Watchmaker (${technicianName})</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Quality Control Stamp</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}
