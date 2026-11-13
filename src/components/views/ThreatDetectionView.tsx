import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Info,
  Activity,
  Layers,
  CheckCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../services/api';
import { SecurityEvent } from '../../types';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';
import { ExplainabilityModal } from '../common/ExplainabilityModal';

export const ThreatDetectionView: React.FC = () => {
  const [anomalies, setAnomalies] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thresholdFilter, setThresholdFilter] = useState<number>(0.65);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnomalies(60);
      setAnomalies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const filteredAnomalies = anomalies.filter((a) => a.anomaly_score >= thresholdFilter);

  return (
    <div className="space-y-6">
      {/* Concept Distinction Alert Banner */}
      <div className="rounded-xl border border-cyan-800/60 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              AI Detection Core: Dual-Engine Threat & Anomaly Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-400">Random Forest Classifier</strong> maps signature patterns against known cyber attacks with measured confidence.
              In parallel, <strong className="text-amber-400">Isolation Forest</strong> isolates statistical outliers in high-dimensional flow features to catch unseen zero-day probes.
              <span className="block mt-1 text-slate-400">
                Crucial distinction: <em className="text-slate-200">Model Confidence</em> is the statistical probability of a class match; <em className="text-slate-200">Threat Severity</em> is the prioritized organizational risk score (0-100).
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Slider and Header Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Unsupervised Statistical Outliers (Isolation Forest)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Displaying flow vectors with continuous anomaly scores above threshold
          </p>
        </div>

        {/* Dynamic Threshold Slider */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Sensitivity:</span>
          <input
            type="range"
            min="0.30"
            max="0.90"
            step="0.05"
            value={thresholdFilter}
            onChange={(e) => setThresholdFilter(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
          <span className="text-xs font-mono font-bold text-cyan-400">{thresholdFilter.toFixed(2)}</span>
        </div>
      </div>

      {/* Flagged Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            <Activity className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
            Computing multidimensional Isolation Forest scores...
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No events exceed the current anomaly score threshold ({thresholdFilter.toFixed(2)}).
          </div>
        ) : (
          filteredAnomalies.map((ev) => (
            <div
              key={ev.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                    ANOMALY: {ev.anomaly_score.toFixed(3)}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                    {ev.log_source}
                  </span>
                </div>
                <ThreatScoreBadge score={ev.threat_score} level={ev.threat_level} size="sm" />
              </div>

              {/* Event Attributes */}
              <div className="mt-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Source Entity:</span>
                  <span className="font-bold text-cyan-400">{ev.source_ip}:{ev.source_port || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Host:</span>
                  <span className="text-slate-300">{ev.destination_ip || 'Internal Network'}:{ev.destination_port || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">RF Classification:</span>
                  <span className="text-rose-400 font-semibold">{ev.predicted_attack || 'NORMAL'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">RF Confidence:</span>
                  <span className="text-blue-400 font-bold">{(ev.prediction_confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">K-Means Group:</span>
                  <span className="text-purple-400">Cluster #{ev.cluster_id}</span>
                </div>
              </div>

              {/* Primary Reason */}
              <div className="mt-3 rounded bg-slate-950/50 p-2 text-[11px] text-slate-400 border border-slate-800/80 line-clamp-2">
                {ev.threat_reasons && ev.threat_reasons.length > 0
                  ? ev.threat_reasons[0]
                  : 'Statistical profile differs significantly from normal network flow baseline.'}
              </div>

              {/* Inspect Button */}
              <button
                onClick={() => setSelectedEvent(ev)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                <span>Explain Threat Score Factors</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Explainability Detail Modal */}
      <ExplainabilityModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

