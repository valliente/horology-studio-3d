import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Compass,
  Database,
  GitCompare,
  Mic,
  FileText,
  Globe,
  Settings,
  Activity,
  ShieldCheck
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'dsp'
  | 'positional'
  | 'history'
  | 'compare'
  | 'profiles'
  | 'reports'
  | 'ntp';

interface LeftSidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentView, onSelectView }) => {
  const navItems: Array<{ id: NavView; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dsp', label: 'DSP Engine Chain', icon: Sliders },
    { id: 'positional', label: 'Positional Stability', icon: Compass, badge: '6-POS' },
    { id: 'history', label: 'Session Database', icon: Database },
    { id: 'compare', label: 'Session Compare', icon: GitCompare },
    { id: 'profiles', label: 'Mic Calibration', icon: Mic },
    { id: 'reports', label: 'PDF Service Reports', icon: FileText },
    { id: 'ntp', label: 'NTP Time Sync', icon: Globe, badge: 'ST-1' },
  ];

  return (
    <aside className="w-64 bg-[#10131b] border-r border-pro-border flex flex-col justify-between select-none z-30 shrink-0">
      {/* Top App Logo & Pro Title */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-pro-border/60">
          <div className="p-2.5 rounded-xl bg-pro-card border border-pro-cyan/40 text-pro-cyan shadow-cyan-glow">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide text-white font-sans">
                TIMEGRAPHER
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-pro-blue text-white shadow-blue-glow tracking-wider uppercase">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-pro-muted font-medium mt-0.5">
              Acoustic Diagnostic Suite
            </p>
          </div>
        </div>

        {/* Primary Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-pro-dim uppercase tracking-wider">
            Diagnostic Suite
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-pro-cyan/15 text-pro-cyan border border-pro-cyan/40 shadow-cyan-glow font-bold'
                    : 'text-pro-muted hover:text-white hover:bg-pro-hover/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pro-cyan' : 'text-pro-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-pro-cyan text-black' : 'bg-pro-card text-pro-muted border border-pro-border'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / System Status Footer */}
      <div className="p-4 border-t border-pro-border/60 bg-[#0c0e14]">
        <div className="flex items-center justify-between text-xs text-pro-muted mb-2">
          <span className="flex items-center gap-1.5 font-bold text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-pro-cyan" /> CHRONO PRO v2.0
          </span>
          <span className="text-[10px] text-pro-cyan bg-pro-cyan/10 px-2 py-0.5 rounded font-mono">
            DSP READY
          </span>
        </div>
        <p className="text-[10px] text-pro-dim leading-tight">
          Enterprise Mechanical Watch Escapement Calibration Platform
        </p>
      </div>
    </aside>
  );
};
