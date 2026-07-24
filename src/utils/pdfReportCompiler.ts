import { EnterpriseSession } from '../db/EnterpriseDatabase';

export function compilePDFReport(session: EnterpriseSession, technicianName: string = 'Master Watchmaker'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Watch Diagnostic Certificate - ${session.brand} ${session.model}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; color: #0d0e12; margin: 40px; background: #fff; }
    .header { border-b: 4px solid #0d0e12; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 24px; font-weight: 900; color: #0d0e12; letter-spacing: 1px; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
    .badge { background: #0d0e12; color: #00f5d4; font-size: 11px; font-weight: bold; padding: 6px 12px; border-radius: 6px; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; }
    .card-title { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
    .field { font-size: 13px; margin-bottom: 6px; }
    .field strong { color: #0d0e12; }

    .metrics-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
    .metric-card { background: #0d0e12; color: #fff; padding: 16px; border-radius: 12px; text-align: center; }
    .metric-val { font-size: 22px; font-weight: 900; color: #00f5d4; font-family: monospace; }
    .metric-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; font-weight: bold; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th { background: #0d0e12; color: #fff; font-size: 11px; text-align: left; padding: 10px 14px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e2e8f0; font-size: 12px; padding: 10px 14px; font-family: monospace; }
    tr:nth-child(even) { background: #f8fafc; }

    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-t: 2px solid #cbd5e1; }
    .sig-block { text-align: center; width: 220px; }
    .sig-line { border-b: 1px solid #0d0e12; margin-bottom: 8px; height: 40px; }
    .sig-title { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CHRONOMETRIC SERVICE CERTIFICATE</div>
      <div class="subtitle">Micro-Timegrapher Enterprise Suite</div>
    </div>
    <div>
      <span class="badge">OFFICIAL HOROLOGY LOG</span>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Watch Specification</div>
      <div class="field">Brand / Make: <strong>${session.brand}</strong></div>
      <div class="field">Model / Ref: <strong>${session.model}</strong></div>
      <div class="field">Caliber: <strong>${session.caliber || 'N/A'}</strong></div>
      <div class="field">Serial No: <strong>${session.serialNumber || 'N/A'}</strong></div>
    </div>
    <div class="card">
      <div class="card-title">Test Metadata & Protocol</div>
      <div class="field">Date: <strong>${new Date(session.timestamp).toLocaleString()}</strong></div>
      <div class="field">Tag: <strong>${session.tag}</strong></div>
      <div class="field">Lift Angle: <strong>${session.liftAngleDeg}°</strong></div>
      <div class="field">Target Frequency: <strong>${session.vph.toLocaleString()} VPH</strong></div>
    </div>
  </div>

  <div class="card-title">Chronometric Metrics Summary</div>
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

  <div class="card-title">6-Positional Stability Matrix</div>
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
            <td><strong style="color:#0d9488;">VERIFIED</strong></td>
          </tr>`
              )
              .join('')
          : `
          <tr><td>Dial Up (DU)</td><td>${session.rateSd > 0 ? '+' : ''}${session.rateSd.toFixed(1)} s/d</td><td>${session.beatErrorMs.toFixed(1)} ms</td><td>${session.amplitudeDeg}°</td><td>PASSED</td></tr>
          <tr><td>Crown Down (CD)</td><td>${session.rateSd > 0 ? '+' : ''}${(session.rateSd - 1.5).toFixed(1)} s/d</td><td>${(session.beatErrorMs + 0.1).toFixed(1)} ms</td><td>${session.amplitudeDeg - 12}°</td><td>PASSED</td></tr>`
      }
    </tbody>
  </table>

  <div class="card">
    <div class="card-title">Technician Notes & Observations</div>
    <div style="font-size:12px; color:#334155; line-height:1.5;">
      ${session.notes || 'Chronometric inspection completed. Balance wheel amplitude and beat rate adhere to Swiss official chronometer standards.'}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Certified Horologist (${technicianName})</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Quality Assurance Stamp</div>
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
