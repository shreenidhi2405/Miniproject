import {
  OverviewStats,
  SecurityEvent,
  Incident,
  ThreatPattern,
  AssociationRule,
  ClusterSummary,
  DatasetItem,
  SystemSettings,
  ModelMetrics
} from '../types';

const API_BASE = '/api';

export const api = {
  // Overview Stats
  async getOverview(): Promise<OverviewStats> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  // Security Events & Logs
  async getEvents(params: {
    dataset_id?: string;
    log_source?: string;
    threat_level?: string;
    attack_category?: string;
    is_anomaly?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; page: number; limit: number; events: SecurityEvent[] }> {
    const query = new URLSearchParams();
    if (params.dataset_id) query.append('dataset_id', params.dataset_id);
    if (params.log_source) query.append('log_source', params.log_source);
    if (params.threat_level) query.append('threat_level', params.threat_level);
    if (params.attack_category) query.append('attack_category', params.attack_category);
    if (params.is_anomaly !== undefined) query.append('is_anomaly', String(params.is_anomaly));
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/logs/events?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch security events');
    return res.json();
  },

  async getDatasets(): Promise<DatasetItem[]> {
    const res = await fetch(`${API_BASE}/logs/datasets`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  async uploadDataset(file: File, sourceType: string = 'mixed'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_type', sourceType);
    formData.append('auto_process', 'true');

    const res = await fetch(`${API_BASE}/logs/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  // Threat Detection & Explainability
  async getAnomalies(limit: number = 50): Promise<SecurityEvent[]> {
    const res = await fetch(`${API_BASE}/detection/anomalies?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch anomaly records');
    return res.json();
  },

  async getEventExplanation(eventId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/detection/event/${eventId}`);
    if (!res.ok) throw new Error('Failed to fetch event explanation');
    return res.json();
  },

  // Attack Correlation
  async getIncidents(severityLevel?: string): Promise<Incident[]> {
    const query = severityLevel && severityLevel !== 'all' ? `?severity_level=${severityLevel}` : '';
    const res = await fetch(`${API_BASE}/correlation/incidents${query}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentDetail(incidentId: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/correlation/incidents/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch incident detail');
    return res.json();
  },

  // Threat Memory
  async getThreatPatterns(status?: string, velocityOnly?: boolean): Promise<ThreatPattern[]> {
    const query = new URLSearchParams();
    if (status && status !== 'all') query.append('status', status);
    if (velocityOnly) query.append('velocity_only', 'true');

    const res = await fetch(`${API_BASE}/memory/patterns?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch threat memory patterns');
    return res.json();
  },

  async updateThreatPattern(patternId: string, status: string, analystNotes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/memory/patterns/${patternId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, analyst_notes: analystNotes }),
    });
    if (!res.ok) throw new Error('Failed to update threat pattern status');
    return res.json();
  },

  // Data Mining
  async getAprioriRules(): Promise<AssociationRule[]> {
    const res = await fetch(`${API_BASE}/mining/apriori`);
    if (!res.ok) throw new Error('Failed to fetch Apriori association rules');
    return res.json();
  },

  async getClusters(): Promise<ClusterSummary[]> {
    const res = await fetch(`${API_BASE}/mining/clusters`);
    if (!res.ok) throw new Error('Failed to fetch K-Means clusters');
    return res.json();
  },

  // AI Analytics & Models
  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/analytics/models`);
    if (!res.ok) throw new Error('Failed to fetch model evaluation metrics');
    return res.json();
  },

  async trainModels(datasetId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/train?dataset_id=${datasetId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to retrain models');
    return res.json();
  },

  // Reports
  async getExecutiveSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/summary`);
    if (!res.ok) throw new Error('Failed to fetch executive summary');
    return res.json();
  },

  getExportCsvUrl(threatLevel?: string, logSource?: string): string {
    const query = new URLSearchParams();
    if (threatLevel && threatLevel !== 'all') query.append('threat_level', threatLevel);
    if (logSource && logSource !== 'all') query.append('log_source', logSource);
    return `${API_BASE}/reports/export-csv?${query.toString()}`;
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings/`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async seedSamples(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/seed-samples`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed benchmark samples');
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/reset-data`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  }
};

