import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  History,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Edit3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { ThreatPattern } from '../../types';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';
import { Modal } from '../common/Modal';

export const ThreatMemoryView: React.FC = () => {
  const [patterns, setPatterns] = useState<ThreatPattern[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [velocityOnly, setVelocityOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review status modal state
  const [editingPattern, setEditingPattern] = useState<ThreatPattern | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Reviewed');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const data = await api.getThreatPatterns(
        selectedStatus !== 'all' ? selectedStatus : undefined,
        velocityOnly
      );
      setPatterns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [selectedStatus, velocityOnly]);

  const handleOpenReview = (pattern: ThreatPattern) => {
    setEditingPattern(pattern);
    setNewStatus(pattern.status === 'Unknown Anomaly' ? 'Reviewed' : pattern.status);
    setAnalystNotes(pattern.analyst_notes || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPattern) return;
    setIsUpdating(true);
    try {
      await api.updateThreatPattern(editingPattern.pattern_id, newStatus, analystNotes);
      setEditingPattern(null);
      await fetchPatterns();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              Persistent Emerging Threat Memory
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Maintains temporal state across log batches. Tracks recurrence velocity, structural signatures, and enables human-in-the-loop analyst triage.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 font-mono">
              <input
                type="checkbox"
                checked={velocityOnly}
                onChange={(e) => setVelocityOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 h-4 w-4"
              />
              <span className="text-amber-400 font-semibold">High Velocity Escalating</span>
            </label>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="Unknown Anomaly">Unknown Anomaly</option>
              <option value="Emerging Suspicious Pattern">Emerging Suspicious Pattern</option>
              <option value="Reviewed">Reviewed</option>
              <option value="False Positive">False Positive</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            <Activity className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
            Querying persistent threat memory signatures...
          </div>
        ) : patterns.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No threat memory patterns found matching the selected filter.
          </div>
        ) : (
          patterns.map((p) => {
            const isVelocity = p.velocity_flag;
            return (
              <div
                key={p.pattern_id}
                className={`group relative rounded-xl border p-5 backdrop-blur-md transition-all duration-200 flex flex-col justify-between ${
                  isVelocity
                    ? 'border-amber-600/60 bg-amber-950/15 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{p.pattern_id}</span>
                      {isVelocity && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 animate-pulse">
                          <TrendingUp className="h-3 w-3" /> ESCALATING
                        </span>
                      )}
                    </div>
                    <ThreatScoreBadge score={p.avg_threat_score} level={p.avg_threat_score >= 75 ? 'Critical' : 'High'} size="sm" />
                  </div>

                  {/* Title & Signature */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-white tracking-wide">{p.pattern_type}</h4>
                    <p className="mt-1 font-mono text-[11px] text-slate-400 bg-slate-950/60 rounded px-2 py-1 border border-slate-800/60 break-all">
                      {p.signature}
                    </p>
                  </div>

                  {/* Temporal Stats */}
                  <div className="mt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Total Recurrence:</span>
                      <span className="text-white font-bold">{p.occurrence_count} times</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>First Observed:</span>
                      <span className="text-slate-300 text-[11px]">{p.first_seen}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Last Observed:</span>
                      <span className="text-slate-300 text-[11px]">{p.last_seen}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Affected Entities:</span>
                      <span className="text-cyan-400 font-bold">{p.affected_ips?.length || 1} IPs</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">Triage Status:</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-mono font-semibold ${
                        p.status === 'Reviewed'
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                          : p.status === 'False Positive'
                          ? 'bg-slate-800 border border-slate-700 text-slate-400'
                          : p.status === 'Escalated'
                          ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                          : 'bg-amber-950/40 border border-amber-800/60 text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Analyst Notes */}
                  {p.analyst_notes && (
                    <div className="mt-3 rounded bg-slate-950/40 p-2 text-[11px] text-slate-400 border border-slate-800/80 italic">
                      "{p.analyst_notes}"
                    </div>
                  )}
                </div>

                {/* Triage Action Button */}
                <button
                  onClick={() => handleOpenReview(p)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Update Analyst Triage</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Review Dialog Modal */}
      {editingPattern && (
        <Modal
          isOpen={Boolean(editingPattern)}
          onClose={() => setEditingPattern(null)}
          title={`Threat Memory Triage: ${editingPattern.pattern_id}`}
          subtitle={editingPattern.pattern_type}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveReview} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Investigation Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Unknown Anomaly">Unknown Anomaly (Pending)</option>
                <option value="Emerging Suspicious Pattern">Emerging Suspicious Pattern</option>
                <option value="Reviewed">Reviewed (Legitimate Threat Confirmed)</option>
                <option value="False Positive">False Positive (Benign Behavioral Deviation)</option>
                <option value="Escalated">Escalated (SOC Tier 3 Action Required)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Analyst Findings & Notes</label>
              <textarea
                rows={3}
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
                placeholder="Document observed tactics, affected internal hosts, or remediation recommendations..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPattern(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700 font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-450 px-4 py-2 text-black font-sans font-semibold transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Triage Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

