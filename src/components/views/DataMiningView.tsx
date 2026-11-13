import React, { useState, useEffect } from 'react';
import {
  Binary,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Info,
  CheckCircle,
  Hash
} from 'lucide-react';
import { api } from '../../services/api';
import { AssociationRule, ClusterSummary } from '../../types';

export const DataMiningView: React.FC = () => {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'apriori' | 'kmeans'>('apriori');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMiningData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, clustersData] = await Promise.all([
        api.getAprioriRules(),
        api.getClusters(),
      ]);
      setRules(rulesData);
      setClusters(clustersData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMiningData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Binary className="h-4 w-4 text-cyan-400" />
              Unsupervised Data Mining Engine (Apriori & K-Means)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Discovers hidden behavioral patterns, frequent attack itemsets, and cluster groupings from multi-dimensional log vectors.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('apriori')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'apriori'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Apriori Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('kmeans')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'kmeans'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              K-Means Clusters ({clusters.length})
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
          Extracting itemsets and computing cluster centroids...
        </div>
      ) : activeTab === 'apriori' ? (
        /* Apriori Association Rules View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Mined Association Rules (Support, Confidence, Lift)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Lift &gt; 1.0 indicates positive statistical correlation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                No association rules mined. Ingest a dataset with diverse actions or retrain models.
              </div>
            ) : (
              rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Antecedents -> Consequents Header */}
                    <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                      <div className="flex items-center gap-1">
                        {rule.antecedents.map((ante, aIdx) => (
                          <span
                            key={aIdx}
                            className="rounded bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 text-cyan-300 font-bold"
                          >
                            {ante}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <div className="flex items-center gap-1">
                        {rule.consequents.map((cons, cIdx) => (
                          <span
                            key={cIdx}
                            className="rounded bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 text-rose-300 font-bold"
                          >
                            {cons}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                      {rule.explanation}
                    </p>
                  </div>

                  {/* Metrics Bar */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center font-mono">
                    <div className="rounded bg-slate-950/40 p-1.5 border border-slate-800">
                      <span className="block text-[10px] uppercase text-slate-500">Support</span>
                      <span className="text-xs font-bold text-slate-200">{(rule.support * 100).toFixed(1)}%</span>
                    </div>
                    <div className="rounded bg-slate-950/40 p-1.5 border border-slate-800">
                      <span className="block text-[10px] uppercase text-slate-500">Confidence</span>
                      <span className="text-xs font-bold text-cyan-400">{(rule.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="rounded bg-slate-950/40 p-1.5 border border-slate-800">
                      <span className="block text-[10px] uppercase text-slate-500">Lift</span>
                      <span className="text-xs font-bold text-amber-400">{rule.lift.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* K-Means Clusters View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Network Behavioral Clusters (K-Means Centroid Profiling)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Unsupervised partitioning of network flow attributes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((c) => (
              <div
                key={c.cluster_id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-xs border border-purple-500/40">
                        C{c.cluster_id}
                      </span>
                      <span className="text-sm font-semibold text-white">Cluster #{c.cluster_id}</span>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                      {c.percentage}% ({c.size.toLocaleString()} events)
                    </span>
                  </div>

                  {/* Centroid Attributes */}
                  <div className="mt-4 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dominant Protocol:</span>
                      <span className="text-slate-200 font-bold">{c.dominant_protocol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dominant Attack Type:</span>
                      <span
                        className={`font-semibold ${
                          c.dominant_attack !== 'BENIGN' && c.dominant_attack !== 'NORMAL'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {c.dominant_attack}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Avg Anomaly Density:</span>
                      <span className={`font-bold ${c.avg_anomaly_score >= 0.65 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {c.avg_anomaly_score.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Avg Flow Packets:</span>
                      <span className="text-slate-200">{Math.round(c.avg_packet_count)} pkts</span>
                    </div>
                  </div>

                  {/* Insight description */}
                  <p className="mt-4 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

