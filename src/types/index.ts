export interface SecurityEvent {
  id: number;
  dataset_id?: string;
  timestamp: string;
  source_ip: string;
  destination_ip?: string;
  source_port?: number;
  destination_port?: number;
  protocol?: string;
  log_source: 'network' | 'firewall' | 'auth' | 'system' | string;
  raw_label?: string;
  predicted_attack?: string;
  prediction_confidence: number;
  anomaly_score: number;
  is_anomaly: boolean;
  cluster_id: number;
  threat_score: number;
  threat_level: 'Low' | 'Medium' | 'High' | 'Critical';
  threat_reasons?: string[];
  metadata?: {
    bytes?: number;
    packets?: number;
    duration?: number;
    [key: string]: any;
  };
}

export interface Incident {
  id: string;
  title: string;
  source_ip: string;
  destination_ip?: string;
  start_time: string;
  end_time: string;
  event_count: number;
  attack_category: string;
  severity_score: number;
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  log_sources: string[];
  correlation_reasons: string[];
  status: string;
  created_at: string;
  related_events?: SecurityEvent[];
}

export interface ThreatPattern {
  pattern_id: string;
  signature: string;
  pattern_type: string;
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  velocity_flag: boolean;
  avg_threat_score: number;
  affected_ips: string[];
  status: string;
  analyst_notes?: string;
  reviewed_at?: string;
  sample_event_ids?: number[];
}

export interface AssociationRule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
  explanation: string;
}

export interface ClusterSummary {
  cluster_id: number;
  size: number;
  percentage: number;
  dominant_attack: string;
  dominant_protocol: string;
  avg_anomaly_score: number;
  avg_packet_count: number;
  description: string;
}

export interface OverviewStats {
  total_events: number;
  normal_events: number;
  malicious_events: number;
  anomalies_detected: number;
  critical_incidents: number;
  high_incidents: number;
  source_distribution: Record<string, number>;
  threat_level_distribution: Record<string, number>;
  attack_category_distribution: Record<string, number>;
  traffic_timeline: {
    timestamp: string;
    total: number;
    malicious: number;
    anomalies: number;
  }[];
  top_suspicious_ips: {
    source_ip: string;
    event_count: number;
    avg_threat_score: number;
    max_threat_score: number;
    attacks: string[];
    sources: string[];
  }[];
  processing_engine: string;
}

export interface DatasetItem {
  id: string;
  filename: string;
  original_name: string;
  row_count: number;
  source_type: string;
  is_sample: boolean;
  status: string;
  created_at: string;
}

export interface SystemSettings {
  app_name: string;
  version: string;
  correlation_window_seconds: number;
  min_correlation_events: number;
  anomaly_threshold: number;
  weights: {
    anomaly_weight: number;
    classifier_weight: number;
    frequency_weight: number;
    correlation_weight: number;
    history_weight: number;
  };
  engine_status: {
    active_mode: string;
    implementation: string;
    pyspark_available: boolean;
    cluster_scalable: boolean;
    pipeline_stages: {
      step: number;
      name: string;
      engine: string;
      status: string;
    }[];
  };
}

export interface ModelMetrics {
  dataset_name: string;
  trained_at: string;
  random_forest: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    test_samples?: number;
    train_samples?: number;
    classes?: string[];
    confusion_matrix?: number[][];
    class_metrics?: Record<string, { precision: number; recall: number; f1_score: number; support: number }>;
    feature_importances?: { feature: string; importance: number }[];
  };
  isolation_forest: {
    total_samples?: number;
    anomalies_detected: number;
    anomaly_rate?: number;
    mean_anomaly_score?: number;
    p95_anomaly_score?: number;
  };
  kmeans: ClusterSummary[];
  apriori_rules_count: number;
}

