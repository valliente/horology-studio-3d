import React from 'react';
import {
  Home,
  Clock,
  Compass,
  Database,
  FileText,
  Sliders,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type StudioView =
  | 'home'
  | 'timegrapher'
  | 'positional'
  | 'database'
  | 'reports'
  | 'settings';

interface StudioSidebarProps {
  currentView: StudioView;
  onSelectView: (view: StudioView) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ currentView, onSelectView }) => {
  const navItems: Array<{ id: StudioView; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'timegrapher', label: 'Timegrapher', icon: Clock, badge: 'LIVE' },
    { id: 'positional', label: 'Multi-Position', icon: Compass, badge: 'RADAR' },
    { id: 'database', label: 'Watch Library', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#101115] border-r border-ent-border flex flex-col justify-between select-none z-30 shrink-0">
      <div>
        {/* Profile Card (Directive from ac6597f9ca9857740d4b2b5ee17ddc45.jpg) */}
        <div className="p-4 border-b border-ent-border/60">
          <div className="bg-[#181a22] border border-ent-border/80 rounded-2xl p-3 flex items-center gap-3 shadow-card-shadow">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ent-cyan via-teal-500 to-ent-purple flex items-center justify-center font-black text-black text-sm shadow-cyan-glow">
              HL
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-white tracking-wide truncate">
                  Horology Lab
                </span>
                <span className="w-2 h-2 rounded-full bg-ent-cyan animate-pulse"></span>
              </div>
              <p className="text-[10px] text-ent-muted font-bold tracking-wider uppercase mt-0.5">
                Master Tech v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3.5 py-2 text-[10px] font-extrabold text-ent-dim uppercase tracking-widest">
            WORKSTATION NAVIGATION
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-ent-cyan/15 text-ent-cyan border border-ent-cyan/40 shadow-cyan-glow font-bold'
                    : 'text-ent-muted hover:text-white hover:bg-ent-hover/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-ent-cyan' : 'text-ent-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg ${
                    isActive ? 'bg-ent-cyan text-black font-black' : 'bg-[#0B0C10] text-ent-muted border border-ent-border'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-ent-cyan' : 'text-ent-dim'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Branding */}
      <div className="p-4 border-t border-ent-border/60 bg-[#08090C]">
        <div className="flex items-center justify-between text-xs text-ent-muted mb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-gray-200">
            <ShieldCheck className="w-4 h-4 text-ent-cyan" /> ELECTRON PRO v1.0
          </span>
          <span className="text-[10px] font-black text-ent-purple bg-ent-purple/10 px-2 py-0.5 rounded-lg font-mono">
            ELECTRON
          </span>
        </div>
        <p className="text-[10px] text-ent-dim leading-tight">
          Single-Prompt Auto-Building Desktop Workstation
        </p>
      </div>
    </aside>
  );
};
