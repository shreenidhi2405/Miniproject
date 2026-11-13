import React from 'react';
import { RefreshCw, Database, Server, ShieldCheck, Zap } from 'lucide-react';

interface TopbarProps {
  onRefresh: () => void;
  isLoading: boolean;
  totalEvents: number;
  engineMode: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onRefresh,
  isLoading,
  totalEvents,
  engineMode,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#090d16]/90 px-6 backdrop-blur-md flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          Cyber Threat Intelligence & Mining Platform
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700/60">
          <Database className="h-3 w-3 text-cyan-400" />
          <span>{totalEvents.toLocaleString()} Events Analyzed</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Big Data Engine Mode Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-cyan-800/40 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-300">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">{engineMode || 'Accelerated Local Engine'}</span>
        </div>

        {/* Reload / Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          title="Refresh intelligence metrics from backend"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>
    </header>
  );
};

