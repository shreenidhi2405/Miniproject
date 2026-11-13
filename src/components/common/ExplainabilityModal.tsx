import React from 'react';
import { Modal } from './Modal';
import { ThreatScoreBadge } from './ThreatScoreBadge';
import { SecurityEvent } from '../../types';
import { ShieldAlert, Cpu, Network, Clock, ListFilter } from 'lucide-react';

interface ExplainabilityModalProps {
  event: SecurityEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Explainable Threat Intelligence - Event #${event.id}`}
      subtitle={`Timestamp: ${event.timestamp} | Source: ${event.log_source.toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Score Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Threat Score Card */}
          <div className="rounded-lg border border-slate-700/60 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Composite Threat Score</span>
              <ThreatScoreBadge score={event.threat_score} level={event.threat_level} size="md" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyan-400">
                {Math.round(event.threat_score)}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Evaluated priority based on anomaly deviation, attack classification, frequency & correlation.
            </p>
          </div>

          {/* Model Confidence Card */}
          <div className="rounded-lg border border-slate-700/60 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Model Classification</span>
              <span className="rounded bg-blue-950/80 border border-blue-700/50 px-2 py-0.5 text-xs font-mono text-blue-300">
                {event.predicted_attack || event.raw_label || 'NORMAL'}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-blue-400">
                {(event.prediction_confidence * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">confidence</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Random Forest probability for detected class. High confidence does not equal high threat.
            </p>
          </div>
        </div>

        {/* Explainability Breakdown Factors */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Cpu className="h-4 w-4" />
            Scoring Formula Breakdown & Reasons
          </h4>
          <div className="mt-3 space-y-2">
            {event.threat_reasons && event.threat_reasons.length > 0 ? (
              event.threat_reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-slate-300"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-xs leading-relaxed">{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No elevated threat indicators triggered.</p>
            )}
          </div>
        </div>

        {/* Machine Learning Features & Telemetry Table */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <Network className="h-4 w-4" />
            Event Telemetry Attributes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Source IP</span>
              <span className="text-slate-200">{event.source_ip}:{event.source_port || '-'}</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Destination IP</span>
              <span className="text-slate-200">{event.destination_ip || 'Internal Network'}:{event.destination_port || '-'}</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Protocol</span>
              <span className="text-slate-200">{event.protocol || 'TCP'}</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Anomaly Score (IF)</span>
              <span className="text-amber-400 font-bold">{event.anomaly_score.toFixed(3)}</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">K-Means Cluster</span>
              <span className="text-purple-400">Cluster #{event.cluster_id}</span>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950/40 p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Total Bytes / Packets</span>
              <span className="text-slate-200">{event.metadata?.bytes?.toLocaleString() || 0} B / {event.metadata?.packets || 0} Pkts</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-medium text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </Modal>
  );
};

