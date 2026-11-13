import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  DownloadCloud,
  FileText,
  ShieldAlert,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';

export const ReportsView: React.FC = () => {
  const [summaryReport, setSummaryReport] = useState<any>(null);
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExecutiveSummary();
      setSummaryReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(selectedThreatLevel, selectedSource);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Export Options Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
              Intelligence Reporting & CSV Export Center
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Export filtered event streams for SIEM ingestion (Splunk, Elastic) or download the synthesized executive security briefing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedThreatLevel}
              onChange={(e) => setSelectedThreatLevel(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical Only (75-100)</option>
              <option value="High">High & Critical (&gt;=50)</option>
              <option value="Medium">Medium (25-49)</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Log Sources</option>
              <option value="network">Network Traffic</option>
              <option value="firewall">Firewall</option>
              <option value="auth">Authentication</option>
              <option value="system">System</option>
            </select>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-450 px-4 py-1.5 text-xs font-semibold text-black transition-colors"
            >
              <DownloadCloud className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Briefing Card (Printable / Readable) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 border border-cyan-800">
                EXECUTIVE CTI BRIEFING
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Generated: {summaryReport?.generated_at || 'Just Now'}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-white tracking-wide">
              Cyber Threat Intelligence Executive Posture Report
            </h3>
          </div>

          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            <Activity className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
            Synthesizing intelligence summary...
          </div>
        ) : summaryReport ? (
          <div className="space-y-6 text-xs font-mono">
            {/* Key Totals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-[10px] uppercase text-slate-500 block">Total Analyzed Events</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {summaryReport.summary?.total_analyzed_events?.toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3.5">
                <span className="text-[10px] uppercase text-rose-400 block">Critical Threat Events</span>
                <span className="text-xl font-bold text-rose-400 mt-1 block">
                  {summaryReport.summary?.critical_threat_events?.toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3.5">
                <span className="text-[10px] uppercase text-amber-400 block">Correlated Active Incidents</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">
                  {summaryReport.summary?.correlated_active_incidents}
                </span>
              </div>
              <div className="rounded-lg border border-cyan-900/50 bg-cyan-950/20 p-3.5">
                <span className="text-[10px] uppercase text-cyan-400 block">Escalating Threat Patterns</span>
                <span className="text-xl font-bold text-cyan-400 mt-1 block">
                  {summaryReport.summary?.high_velocity_emerging_patterns}
                </span>
              </div>
            </div>

            {/* Top Threat Vectors Table */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Prevalent Attack Vectors in Ingested Telemetry
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-950/70 text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Attack Category</th>
                      <th className="py-2.5 px-4 font-medium">Recorded Volume</th>
                      <th className="py-2.5 px-4 font-medium">Mean Threat Score</th>
                      <th className="py-2.5 px-4 font-medium">Impact Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {summaryReport.top_threat_vectors?.map((vec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 font-bold text-rose-400">{vec.attack}</td>
                        <td className="py-2 px-4 text-slate-200">{vec.occurrences}</td>
                        <td className="py-2 px-4 text-cyan-400">{vec.avg_threat_score}/100</td>
                        <td className="py-2 px-4">
                          <ThreatScoreBadge
                            score={vec.avg_threat_score}
                            level={vec.avg_threat_score >= 75 ? 'Critical' : 'High'}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Priority Active Incidents List */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Priority Correlated Security Incidents Requiring SOC Action
              </h4>
              <div className="space-y-2">
                {summaryReport.priority_incidents?.map((inc: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">{inc.id}</span>
                        <span className="text-white font-semibold font-sans">{inc.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Attacker: {inc.source_ip} | Category: {inc.category} | Correlation: {(inc.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <ThreatScoreBadge score={inc.score} level={inc.severity} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

