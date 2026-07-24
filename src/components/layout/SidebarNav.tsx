import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Compass,
  Database,
  FileText,
  Globe,
  Activity,
  HardDrive,
  ShieldCheck
} from 'lucide-react';

export type EntNavView =
  | 'dashboard'
  | 'dsp'
  | 'positional'
  | 'database'
  | 'reports'
  | 'ntp';

interface SidebarNavProps {
  currentView: EntNavView;
  onSelectView: (view: EntNavView) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, onSelectView }) => {
  const navItems: Array<{ id: EntNavView; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dsp', label: 'WASM DSP Chain', icon: Sliders },
    { id: 'positional', label: '6-Position Radar', icon: Compass, badge: 'RADAR' },
    { id: 'database', label: 'Sessions & WAV', icon: Database },
    { id: 'reports', label: 'PDF Certificates', icon: FileText },
    { id: 'ntp', label: 'NTP Time Sync', icon: Globe, badge: 'ST-1' },
  ];

  return (
    <aside className="w-64 bg-[#14161D] border-r border-ent-border flex flex-col justify-between select-none z-30 shrink-0">
      <div>
        {/* Top Logo & Title */}
        <div className="p-5 flex items-center gap-3 border-b border-ent-border/60">
          <div className="p-2.5 rounded-xl bg-[#0D0E12] border border-ent-cyan/40 text-ent-cyan shadow-cyan-glow">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide text-white font-sans">
                TIMEGRAPHER
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-ent-blue text-white shadow-blue-glow tracking-wider uppercase">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-ent-muted font-medium mt-0.5">
              Horological Workstation
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-ent-dim uppercase tracking-wider">
            Diagnostic Suite
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-ent-cyan/15 text-ent-cyan border border-ent-cyan/40 shadow-cyan-glow font-bold'
                    : 'text-ent-muted hover:text-white hover:bg-ent-hover/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-ent-cyan' : 'text-ent-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-ent-cyan text-black' : 'bg-[#0D0E12] text-ent-muted border border-ent-border'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status */}
      <div className="p-4 border-t border-ent-border/60 bg-[#0A0B0F]">
        <div className="flex items-center justify-between text-xs text-ent-muted mb-2">
          <span className="flex items-center gap-1.5 font-bold text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-ent-cyan" /> ENTERPRISE v3.0
          </span>
          <span className="text-[10px] text-ent-cyan bg-ent-cyan/10 px-2 py-0.5 rounded font-mono">
            WASM DSP
          </span>
        </div>
        <p className="text-[10px] text-ent-dim leading-tight">
          Precision Mechanical Watch Calibration Workstation
        </p>
      </div>
    </aside>
  );
};
