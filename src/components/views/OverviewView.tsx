import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  TrendingUp,
  Server,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { StatCard } from '../common/StatCard';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';
import { OverviewStats } from '../../types';

interface OverviewViewProps {
  stats: OverviewStats | null;
  onNavigateToTab: (tab: any) => void;
  onInspectIp?: (ip: string) => void;
}

const THREAT_COLORS: Record<string, string> = {
  Critical: '#f43f5e',
  High: '#f59e0b',
  Medium: '#eab308',
  Low: '#10b981',
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  onNavigateToTab,
  onInspectIp,
}) => {
  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
          <Activity className="h-5 w-5 animate-spin" />
          Loading Security Intelligence Telemetry...
        </div>
      </div>
    );
  }

  // Format threat distribution for PieChart
  const threatPieData = Object.entries(stats.threat_level_distribution || {}).map(
    ([name, value]) => ({ name, value })
  );

  // Format attack distribution for BarChart
  const attackBarData = Object.entries(stats.attack_category_distribution || {})
    .filter(([name]) => name !== 'BENIGN' && name !== 'NORMAL')
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Events Analyzed"
          value={stats.total_events}
          subtitle="Multi-source normalized"
          icon={Layers}
          color="cyan"
          trend="+SIMD Vectorized"
        />
        <StatCard
          title="Malicious Traffic"
          value={stats.malicious_events}
          subtitle={`${((stats.malicious_events / Math.max(1, stats.total_events)) * 100).toFixed(1)}% of total volume`}
          icon={Flame}
          color="red"
        />
        <StatCard
          title="Statistical Anomalies"
          value={stats.anomalies_detected}
          subtitle="Isolation Forest flagged"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical Incidents"
          value={stats.critical_incidents}
          subtitle="Correlated multi-source"
          icon={ShieldAlert}
          color="red"
          trend="Score >= 75"
        />
        <StatCard
          title="Normal Traffic"
          value={stats.normal_events}
          subtitle="Verified benign flows"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Timeline Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Security Traffic & Anomaly Velocity Over Time
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total events, malicious classifications, and unsupervised statistical anomalies
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              Real-Time Slices
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.traffic_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTotal)" name="Total Events" />
                <Area type="monotone" dataKey="malicious" stroke="#f43f5e" fillOpacity={1} fill="url(#colorMalicious)" name="Malicious" />
                <Area type="monotone" dataKey="anomalies" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAnomalies)" name="Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Level Distribution Pie Chart (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Threat Severity Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Categorized by 0-100 composite risk scoring</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={THREAT_COLORS[entry.name] || '#64748b'}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {threatPieData.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: THREAT_COLORS[t.name] || '#64748b' }}
                />
                <span className="text-slate-300">{t.name}:</span>
                <span className="font-bold text-white">{t.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Attack Categories & Top Suspicious IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Category Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Top Attack Classifications</h3>
              <p className="text-xs text-slate-400 mt-0.5">Identified via Random Forest Classifier</p>
            </div>
            <button
              onClick={() => onNavigateToTab('detection')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Details <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackBarData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={85} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Suspicious IPs Table (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Priority Threat Actors & Suspicious IPs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by composite threat severity and event burst volume</p>
            </div>
            <button
              onClick={() => onNavigateToTab('logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Explore All <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                <tr>
                  <th className="pb-3 font-medium">Source IP</th>
                  <th className="pb-3 font-medium">Events</th>
                  <th className="pb-3 font-medium">Avg Threat</th>
                  <th className="pb-3 font-medium">Peak Score</th>
                  <th className="pb-3 font-medium">Associated Attacks</th>
                  <th className="pb-3 font-medium">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stats.top_suspicious_ips?.map((ipItem, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-bold text-cyan-400">
                      {ipItem.source_ip}
                    </td>
                    <td className="py-2.5 text-slate-300">{ipItem.event_count}</td>
                    <td className="py-2.5">
                      <ThreatScoreBadge
                        score={ipItem.avg_threat_score}
                        level={ipItem.avg_threat_score >= 75 ? 'Critical' : ipItem.avg_threat_score >= 50 ? 'High' : 'Medium'}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 text-rose-400 font-bold">{Math.round(ipItem.max_threat_score)}</td>
                    <td className="py-2.5 text-slate-300 max-w-xs truncate">
                      {ipItem.attacks?.filter(a => a !== 'BENIGN' && a !== 'NORMAL').join(', ') || 'Normal'}
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        {ipItem.sources?.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 uppercase"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

