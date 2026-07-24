export interface NTPSyncStatus {
  server: string;
  stratum: number;
  offsetMs: number;
  roundTripMs: number;
  lastSynced: string;
  status: 'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE';
}

export class NTPSyncService {
  private status: NTPSyncStatus = {
    server: 'time.nist.gov (Stratum 1)',
    stratum: 1,
    offsetMs: 0.14,
    roundTripMs: 14.2,
    lastSynced: new Date().toLocaleTimeString(),
    status: 'SYNCHRONIZED',
  };

  public async sync(): Promise<NTPSyncStatus> {
    this.status.status = 'SYNCING';

    // Simulate NTP network roundtrip & Stratum-1 calculation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedOffset = (Math.random() * 0.4 - 0.2); // +/- 0.2ms atomic offset
    const simulatedLatency = 12 + Math.random() * 8;

    this.status = {
      server: 'time.google.com (Stratum 1 Atomic)',
      stratum: 1,
      offsetMs: Math.round(simulatedOffset * 100) / 100,
      roundTripMs: Math.round(simulatedLatency * 10) / 10,
      lastSynced: new Date().toLocaleTimeString(),
      status: 'SYNCHRONIZED',
    };

    return this.status;
  }

  public getStatus(): NTPSyncStatus {
    return this.status;
  }
}
