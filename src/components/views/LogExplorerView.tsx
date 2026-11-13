import React, { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Filter,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { api } from '../../services/api';
import { SecurityEvent, DatasetItem } from '../../types';
import { ThreatScoreBadge } from '../common/ThreatScoreBadge';
import { ExplainabilityModal } from '../common/ExplainabilityModal';

interface LogExplorerViewProps {
  onRefreshGlobal: () => void;
}

export const LogExplorerView: React.FC<LogExplorerViewProps> = ({ onRefreshGlobal }) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>('all');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Upload modal state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSourceType, setUploadSourceType] = useState<string>('mixed');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Inspector modal
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchDatasets = async () => {
    try {
      const data = await api.getDatasets();
      setDatasets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents({
        dataset_id: selectedDatasetId || undefined,
        log_source: selectedSource !== 'all' ? selectedSource : undefined,
        threat_level: selectedThreatLevel !== 'all' ? selectedThreatLevel : undefined,
        is_anomaly: anomalyOnly ? true : undefined,
        search: searchQuery || undefined,
        page,
        limit: 50,
      });
      setEvents(data.events);
      setTotalEvents(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedDatasetId, selectedSource, selectedThreatLevel, anomalyOnly, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    try {
      const res = await api.uploadDataset(uploadFile, uploadSourceType);
      setUploadMessage(res.message);
      setUploadFile(null);
      await fetchDatasets();
      await fetchEvents();
      onRefreshGlobal();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload dataset');
    } finally {
      setIsUploading(false);
    }
  };

  const totalPages = Math.ceil(totalEvents / 50) || 1;

  return (
    <div className="space-y-6">
      {/* Upload & Dataset Banner Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Multi-Source Security Log Ingestion & Explorer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports network traffic, firewall, system, and authentication CSV logs (e.g. CIC-IDS2017, UNSW-NB15).
            </p>
          </div>

          {/* Quick upload trigger */}
          <form onSubmit={handleFileUpload} className="flex flex-wrap items-center gap-2">
            <select
              value={uploadSourceType}
              onChange={(e) => setUploadSourceType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="mixed">Auto-Detect / Mixed</option>
              <option value="network">Network Flows (CIC-IDS2017/UNSW)</option>
              <option value="firewall">Firewall Logs</option>
              <option value="auth">Authentication / Login</option>
              <option value="system">System / Syslog</option>
            </select>

            <label className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-cyan-800 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploadFile ? uploadFile.name : 'Select CSV'}</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
              />
            </label>

            <button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="rounded-lg bg-cyan-500 hover:bg-cyan-450 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-black transition-colors"
            >
              {isUploading ? 'Ingesting...' : 'Ingest & Normalize'}
            </button>
          </form>
        </div>

        {uploadMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{uploadMessage}</span>
          </div>
        )}
        {uploadError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-950/40 border border-rose-800/60 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Dataset Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Dataset</label>
            <select
              value={selectedDatasetId}
              onChange={(e) => {
                setSelectedDatasetId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">All Ingested Datasets</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name} ({d.row_count} rows) {d.is_sample ? '[Sample]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Log Source Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Log Source</label>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Sources</option>
              <option value="network">Network Traffic</option>
              <option value="firewall">Firewall Logs</option>
              <option value="auth">Authentication Logs</option>
              <option value="system">System / Syslog</option>
            </select>
          </div>

          {/* Threat Level Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Risk Severity</label>
            <select
              value={selectedThreatLevel}
              onChange={(e) => {
                setSelectedThreatLevel(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical">Critical (75-100)</option>
              <option value="High">High (50-74)</option>
              <option value="Medium">Medium (25-49)</option>
              <option value="Low">Low (0-24)</option>
            </select>
          </div>

          {/* Anomaly Toggle */}
          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={anomalyOnly}
                onChange={(e) => {
                  setAnomalyOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
              />
              <span>Anomalies Only (IF Score)</span>
            </label>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-end">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search IP, port, attack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            </div>
          </form>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white tracking-wide">Normalized Event Stream</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              Showing {events.length} of {totalEvents.toLocaleString()} records
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-3 font-medium">Source</th>
                <th className="py-3 px-3 font-medium">Source IP : Port</th>
                <th className="py-3 px-3 font-medium">Dest IP : Port</th>
                <th className="py-3 px-3 font-medium">Proto</th>
                <th className="py-3 px-3 font-medium">Predicted Threat</th>
                <th className="py-3 px-3 font-medium">Confidence</th>
                <th className="py-3 px-3 font-medium">Anomaly (IF)</th>
                <th className="py-3 px-3 font-medium">Threat Score</th>
                <th className="py-3 px-4 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Querying normalized event store...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No security events match the current filter criteria.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-300">
                        {ev.log_source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 whitespace-nowrap">
                      {ev.source_ip}:{ev.source_port || 0}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {ev.destination_ip || 'Internal Network'}:{ev.destination_port || 0}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{ev.protocol || 'TCP'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          ev.predicted_attack !== 'BENIGN' && ev.predicted_attack !== 'NORMAL'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {ev.predicted_attack || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {(ev.prediction_confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-mono ${
                          ev.is_anomaly ? 'text-amber-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {ev.anomaly_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <ThreatScoreBadge score={ev.threat_score} level={ev.threat_level} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="rounded p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Explain threat scoring formula and reasons"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

