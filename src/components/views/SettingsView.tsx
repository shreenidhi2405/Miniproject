import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Settings,
  Database,
  Zap,
  Server,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { SystemSettings } from '../../types';

interface SettingsViewProps {
  onRefreshGlobal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshGlobal }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states
  const [anomalyWeight, setAnomalyWeight] = useState<number>(0.25);
  const [classifierWeight, setClassifierWeight] = useState<number>(0.35);
  const [frequencyWeight, setFrequencyWeight] = useState<number>(0.15);
  const [correlationWeight, setCorrelationWeight] = useState<number>(0.15);
  const [historyWeight, setHistoryWeight] = useState<number>(0.10);
  const [windowSeconds, setWindowSeconds] = useState<number>(300);
  const [minEvents, setMinEvents] = useState<number>(2);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
      if (data.weights) {
        setAnomalyWeight(data.weights.anomaly_weight);
        setClassifierWeight(data.weights.classifier_weight);
        setFrequencyWeight(data.weights.frequency_weight);
        setCorrelationWeight(data.weights.correlation_weight);
        setHistoryWeight(data.weights.history_weight);
      }
      setWindowSeconds(data.correlation_window_seconds);
      setMinEvents(data.min_correlation_events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await api.updateSettings({
        correlation_window_seconds: windowSeconds,
        min_correlation_events: minEvents,
        weights: {
          anomaly_weight: anomalyWeight,
          classifier_weight: classifierWeight,
          frequency_weight: frequencyWeight,
          correlation_weight: correlationWeight,
          history_weight: historyWeight,
        },
      });
      setSaveStatus('Threat scoring formula weights and correlation thresholds updated successfully.');
      onRefreshGlobal();
    } catch (err: any) {
      setSaveStatus(`Failed to update settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedSamples = async () => {
    setIsLoading(true);
    setSaveStatus('Ingesting and processing benchmark datasets (CIC-IDS2017 & UNSW-NB15)...');
    try {
      await api.seedSamples();
      setSaveStatus('Benchmark datasets populated and processed successfully.');
      onRefreshGlobal();
    } catch (err: any) {
      setSaveStatus(`Error seeding samples: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all security events, incidents, and threat memory?')) {
      return;
    }
    setIsLoading(true);
    try {
      await api.resetData();
      setSaveStatus('Database reset completed.');
      onRefreshGlobal();
    } catch (err: any) {
      setSaveStatus(`Reset failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sumWeights = (
    anomalyWeight +
    classifierWeight +
    frequencyWeight +
    correlationWeight +
    historyWeight
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Formula Customizer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
        <div className="border-b border-slate-800 pb-4 mb-5">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            Configurable Threat Scoring Engine Formula
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Adjust the normalized factor weights used to calculate the composite Threat Score (0–100) for every security event.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Anomaly Weight */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Anomaly Weight (w_anom)</span>
                <span className="text-cyan-400">{anomalyWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={anomalyWeight}
                onChange={(e) => setAnomalyWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Isolation Forest statistical deviation weight</span>
            </div>

            {/* Classifier Weight */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Classifier Weight (w_class)</span>
                <span className="text-cyan-400">{classifierWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={classifierWeight}
                onChange={(e) => setClassifierWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Random Forest attack category & confidence</span>
            </div>

            {/* Frequency Weight */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Burst Frequency (w_freq)</span>
                <span className="text-cyan-400">{frequencyWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={frequencyWeight}
                onChange={(e) => setFrequencyWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Rapid connection rate from same entity</span>
            </div>

            {/* Correlation Weight */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Cross-Log Correlation (w_corr)</span>
                <span className="text-cyan-400">{correlationWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={correlationWeight}
                onChange={(e) => setCorrelationWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Multi-source alignment boost</span>
            </div>

            {/* History Weight */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Threat Memory History (w_hist)</span>
                <span className="text-cyan-400">{historyWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.40"
                step="0.05"
                value={historyWeight}
                onChange={(e) => setHistoryWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Historical suspicious recurrence in memory</span>
            </div>

            {/* Sliding Window Size */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex justify-between text-slate-300 font-semibold mb-2">
                <span>Correlation Window</span>
                <span className="text-cyan-400">{windowSeconds}s ({Math.round(windowSeconds / 60)} min)</span>
              </div>
              <input
                type="range"
                min="60"
                max="1200"
                step="60"
                value={windowSeconds}
                onChange={(e) => setWindowSeconds(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Temporal sliding window for incident grouping</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-slate-400">
              Normalized Weights Sum: <strong className="text-white">{sumWeights}</strong> (automatically normalized to 1.0)
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-cyan-500 hover:bg-cyan-450 px-5 py-2 text-xs font-semibold text-black transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {saveStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 p-2.5 text-xs text-cyan-300 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Big Data Processing Architecture Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              Big Data Processing Engine: Pipeline Mode & Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent execution mode status distinguishing local runtime from distributed PySpark cluster scalability
            </p>
          </div>
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
            {settings?.engine_status?.active_mode || 'Accelerated Local Engine'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <span className="text-[11px] uppercase text-slate-400 font-bold block">Current Active Runtime</span>
            <p className="text-slate-300 leading-relaxed font-sans">
              Currently executing on the <strong>Vectorized NumPy & Pandas SIMD Pipeline</strong>. Highly optimized for interactive response times with datasets up to 500,000+ events on single nodes.
            </p>
            <div className="pt-2 text-[11px] text-cyan-400">
              ✓ Multi-threading & memory mapped zero-copy processing enabled.
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <span className="text-[11px] uppercase text-slate-400 font-bold block">Distributed Spark Scalability</span>
            <p className="text-slate-300 leading-relaxed font-sans">
              The codebase includes the complete PySpark transformation pipeline architecture specification (<code>spark_jobs/threatmine_distributed_pipeline.py</code>) ready for deployment on Apache Spark 3.5+, AWS EMR, or Databricks for multi-gigabyte log streams.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Cluster Scalable: <strong className="text-emerald-400">YES (PySpark Ready)</strong>
            </div>
          </div>
        </div>

        {/* Pipeline Stages Progression */}
        <div className="pt-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold block mb-2">
            Standard Processing Pipeline Stages:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px] font-mono">
            {settings?.engine_status?.pipeline_stages?.map((stage) => (
              <div key={stage.step} className="rounded border border-slate-800 bg-slate-950/40 p-2">
                <span className="text-cyan-400 font-bold block">Stage {stage.step}</span>
                <span className="text-slate-200 block truncate mt-0.5">{stage.name}</span>
                <span className="text-emerald-400 text-[9px] mt-1 block">READY</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Maintenance Actions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white tracking-wide mb-2">
          Data Management & Reset Controls
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Quickly re-populate the benchmark datasets (CIC-IDS2017 & UNSW-NB15) or clear database tables for a clean slate.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedSamples}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 hover:bg-cyan-900/60 px-4 py-2 text-xs font-semibold text-cyan-300 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Seed Benchmark Datasets (CIC-IDS2017 & UNSW-NB15)</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 px-4 py-2 text-xs font-semibold text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Database Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};

