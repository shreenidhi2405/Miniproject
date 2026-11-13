import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../../services/api';
import { Incident } from '../../types';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';
import { Modal } from '../common/Modal';

export const AttackCorrelationView: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Expanded incident details modal
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidents(selectedSeverity !== 'all' ? selectedSeverity : undefined);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedSeverity]);

  const handleOpenIncident = async (inc: Incident) => {
    setIsLoadingDetail(true);
    setActiveIncident(inc);
    try {
      const detail = await api.getIncidentDetail(inc.id);
      setActiveIncident(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-cyan-400" />
              Multi-Source Attack Correlation Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizes network flows, firewall decisions, authentication logs, and system events within a sliding time window to reconstruct multi-stage cyber campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical (75-100)</option>
              <option value="High">High (50-74)</option>
              <option value="Medium">Medium (25-49)</option>
              <option value="Low">Low (0-24)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            <Activity className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
            Correlating cross-log streams across sliding time windows...
          </div>
        ) : incidents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No correlated incidents found for this filter.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{inc.id}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {inc.event_count} Events
                    </span>
                  </div>
                  <ThreatScoreBadge score={inc.severity_score} level={inc.severity_level} size="sm" />
                </div>

                {/* Title & Category */}
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {inc.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-rose-400 font-mono font-medium">
                    {inc.attack_category}
                  </p>
                </div>

                {/* Hosts & Time */}
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Threat Origin:</span>
                    <span className="text-slate-200 font-bold">{inc.source_ip}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target Target:</span>
                    <span className="text-slate-200">{inc.destination_ip || 'Internal Network'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Time Window:</span>
                    <span className="text-slate-400 text-[11px]">{inc.start_time} - {inc.end_time.split(' ')[1] || ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Correlation Evidence:</span>
                    <span className="text-blue-400 font-bold">{(inc.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>

                {/* Associated Log Sources Pills */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-mono">Sources:</span>
                  {inc.log_sources?.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 text-[10px] font-mono uppercase text-cyan-300"
                    >
                      {src}
                    </span>
                  ))}
                </div>

                {/* Correlation Reasons Preview */}
                <div className="mt-3 space-y-1">
                  {inc.correlation_reasons?.slice(0, 2).map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1" />
                      <span className="line-clamp-1">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Timeline Action */}
              <button
                onClick={() => handleOpenIncident(inc)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-cyan-500 hover:text-black transition-all"
              >
                <span>Inspect Correlated Attack Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Incident Deep-Dive Timeline Modal */}
      {activeIncident && (
        <Modal
          isOpen={Boolean(activeIncident)}
          onClose={() => setActiveIncident(null)}
          title={`Incident Inspection: ${activeIncident.id}`}
          subtitle={`${activeIncident.title} | Severity: ${activeIncident.severity_score}/100`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-sm">
            {/* Incident Summary Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                  {activeIncident.attack_category}
                </span>
                <ThreatScoreBadge score={activeIncident.severity_score} level={activeIncident.severity_level} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Threat Actor IP</span>
                  <span className="text-cyan-400 font-bold">{activeIncident.source_ip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Target Scope</span>
                  <span className="text-slate-200">{activeIncident.destination_ip || 'Internal'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Event Volume</span>
                  <span className="text-slate-200">{activeIncident.event_count} Actions</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Correlation Confidence</span>
                  <span className="text-blue-400 font-bold">{(activeIncident.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Correlation Reasons List */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Correlation Justifications & Evidence:
                </span>
                {activeIncident.correlation_reasons?.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded bg-slate-900/60 p-2 text-xs text-slate-300 border border-slate-800/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Timeline Progression */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                <Clock className="h-4 w-4 text-cyan-400" />
                Chronological Attack Progression Timeline
              </h4>

              {isLoadingDetail ? (
                <div className="py-8 text-center text-slate-400 font-mono text-xs">
                  <Activity className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
                  Extracting associated event logs...
                </div>
              ) : activeIncident.related_events && activeIncident.related_events.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeIncident.related_events.map((ev, idx) => (
                    <div key={ev.id || idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />

                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs font-mono">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-slate-400 text-[11px]">{ev.timestamp}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-300">
                            {ev.log_source}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-slate-200">
                            {ev.source_ip}:{ev.source_port || 0} → {ev.destination_ip}:{ev.destination_port || 0} ({ev.protocol || 'TCP'})
                          </span>
                          <span className="text-rose-400 font-bold">{ev.predicted_attack || 'NORMAL'}</span>
                        </div>
                        {ev.threat_reasons && ev.threat_reasons.length > 0 && (
                          <p className="mt-1 text-[11px] text-slate-400 italic">
                            {ev.threat_reasons[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Associated telemetry events matched by Source IP across time window.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

