import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BarChart2,
  Table,
  Zap,
  Layers,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../../services/api';
import { ModelMetrics, DatasetItem } from '../../types';
import { StatCard } from '../common/StatCard';

interface AIAnalyticsViewProps {
  onRefreshGlobal: () => void;
}

export const AIAnalyticsView: React.FC<AIAnalyticsViewProps> = ({ onRefreshGlobal }) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMetricsAndDatasets = async () => {
    setIsLoading(true);
    try {
      const [m, d] = await Promise.all([api.getModelMetrics(), api.getDatasets()]);
      setMetrics(m);
      setDatasets(d);
      if (d.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(d[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndDatasets();
  }, []);

  const handleRetrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) return;

    setIsTraining(true);
    setTrainStatus('Training Random Forest, Isolation Forest, K-Means & mining Apriori rules...');
    try {
      const res = await api.trainModels(selectedDatasetId);
      setTrainStatus('Model retraining completed with newly measured evaluation metrics.');
      await fetchMetricsAndDatasets();
      onRefreshGlobal();
    } catch (err: any) {
      setTrainStatus(`Retraining failed: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const rf = metrics?.random_forest || { accuracy: 0, precision: 0, recall: 0, f1_score: 0 };
  const featImp = rf.feature_importances || [];
  const cm = rf.confusion_matrix || [];
  const classes = rf.classes || [];

  return (
    <div className="space-y-6">
      {/* Retrain Action Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Empirical Model Evaluation & Retraining Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              All metrics below are computed on independent test splits from actual ingested benchmark data.
            </p>
          </div>

          <form onSubmit={handleRetrain} className="flex items-center gap-2">
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name} ({d.row_count} events)
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isTraining || !selectedDatasetId}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-450 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-black transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training...' : 'Retrain on Dataset'}</span>
            </button>
          </form>
        </div>

        {trainStatus && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 p-2.5 text-xs text-cyan-300 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{trainStatus}</span>
          </div>
        )}
      </div>

      {/* Model Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Measured Test Accuracy"
          value={`${(rf.accuracy * 100).toFixed(1)}%`}
          subtitle="Test-set evaluation"
          icon={Award}
          color="cyan"
          trend="Random Forest"
        />
        <StatCard
          title="Weighted Precision"
          value={`${(rf.precision * 100).toFixed(1)}%`}
          subtitle="True positive precision"
          icon={Zap}
          color="emerald"
        />
        <StatCard
          title="Recall (Detection Rate)"
          value={`${(rf.recall * 100).toFixed(1)}%`}
          subtitle="Attack recall coverage"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Harmonic F1-Score"
          value={`${(rf.f1_score * 100).toFixed(1)}%`}
          subtitle="Precision-recall balance"
          icon={Cpu}
          color="purple"
        />
      </div>

      {/* Feature Importances & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importances Bar Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Random Forest Feature Importance Weights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical Gini-impurity reduction per behavioral flow metric
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featImp.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Gini Importance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real Confusion Matrix Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Empirical Confusion Matrix Heatgrid
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Observed true labels (rows) vs model predictions (columns)
              </p>
            </div>

            {cm.length > 0 && classes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                      <th className="py-2 text-left">True \ Pred</th>
                      {classes.map((cls, idx) => (
                        <th key={idx} className="py-2 px-1 truncate max-w-[70px] text-cyan-400">
                          {cls}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {classes.map((trueCls, rIdx) => (
                      <tr key={rIdx}>
                        <td className="py-2 text-left font-bold text-slate-300 truncate max-w-[80px]">
                          {trueCls}
                        </td>
                        {classes.map((_, cIdx) => {
                          const val = cm[rIdx]?.[cIdx] ?? 0;
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-2 text-xs font-semibold ${
                                isDiagonal && val > 0
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 rounded'
                                  : val > 0
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40 rounded'
                                  : 'text-slate-600'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Confusion matrix will populate upon model evaluation.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Model Trained On: {metrics?.dataset_name || 'Benchmark Dataset'}</span>
            <span>Date: {metrics?.trained_at?.split('T')[0] || 'Active'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

