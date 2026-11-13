import React from 'react';
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  GitMerge,
  BrainCircuit,
  Binary,
  LineChart,
  FileSpreadsheet,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'logs'
  | 'detection'
  | 'correlation'
  | 'memory'
  | 'mining'
  | 'analytics'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeIncidentsCount?: number;
  emergingPatternsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeIncidentsCount = 0,
  emergingPatternsCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'logs', label: 'Log Explorer', icon: Search },
    { id: 'detection', label: 'Threat Detection', icon: ShieldAlert },
    {
      id: 'correlation',
      label: 'Attack Correlation',
      icon: GitMerge,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    },
    {
      id: 'memory',
      label: 'Threat Memory',
      icon: BrainCircuit,
      badge: emergingPatternsCount > 0 ? emergingPatternsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    },
    { id: 'mining', label: 'Data Mining', icon: Binary },
    { id: 'analytics', label: 'AI Analytics', icon: LineChart },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#070b14] flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-950/50">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">CYBERMINE</span>
              <span className="text-[10px] font-bold uppercase rounded bg-cyan-950 px-1.5 py-0.2 border border-cyan-700/60 text-cyan-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
              ThreatMine CTI
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Intelligence Center
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">DEFENSIVE SHIELD</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-1.5 py-0.5 rounded">
            ONLINE
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 truncate">Big Data Mining Engine active</p>
      </div>
    </aside>
  );
};

