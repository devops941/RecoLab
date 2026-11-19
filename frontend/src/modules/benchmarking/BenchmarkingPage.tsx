import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DatasetsApi, BenchmarkingApi } from '../../services/api';
import { Dataset, BenchmarkResponse } from '../../types';
import {
  BarChart3,
  Play,
  RefreshCw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  GitCompare,
  Layers,
  Award,
  Crown,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

export const BenchmarkingPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [interactionDatasets, setInteractionDatasets] = useState<Dataset[]>([]);
  const [selectedProductDs, setSelectedProductDs] = useState<string>('ds_default_products');
  const [selectedInterDs, setSelectedInterDs] = useState<string>('ds_default_interactions');
  const [topK, setTopK] = useState<number>(10);
  const [splitRatio, setSplitRatio] = useState<number>(0.2);
  const [splitStrategy, setSplitStrategy] = useState<string>('user_holdout');

  const [loading, setLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResponse | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await DatasetsApi.list();
        const prods = res.data.filter((d: Dataset) => d.dataset_type === 'products');
        const inters = res.data.filter((d: Dataset) => d.dataset_type === 'interactions');
        setDatasets(prods);
        setInteractionDatasets(inters);
      } catch (e) {
        console.error('Failed to load datasets', e);
      }
    };
    fetchDatasets();
  }, []);

  const handleRunBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await BenchmarkingApi.run({
        dataset_id: selectedProductDs,
        interaction_dataset_id: selectedInterDs,
        algorithms: ['content_based', 'item_item', 'hybrid'],
        top_k: topK,
        test_split_ratio: splitRatio,
        split_strategy: splitStrategy,
        content_weight: 0.5,
        interaction_weight: 0.5
      });
      setBenchmarkResult(res.data);
      toast.success(`Benchmarking evaluated in ${res.data.execution_duration_sec}s across ${res.data.total_evaluated_users} test users!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to complete benchmark run');
    } finally {
      setLoading(false);
    }
  };

  const chartData = benchmarkResult?.results.map((r) => ({
    name: r.display_name.split(' ')[0],
    fullName: r.display_name,
    'Precision@K': Math.round(r.metrics.precision_at_k * 100),
    'Recall@K': Math.round(r.metrics.recall_at_k * 100),
    'NDCG@K': Math.round(r.metrics.ndcg_at_k * 100),
    'Catalog Coverage': Math.round(r.metrics.catalog_coverage * 100),
    'Diversity': Math.round(r.metrics.diversity * 100),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Algorithm Benchmarking Arena
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Zero data-leakage empirical evaluation comparing TF-IDF Vectorization, SciPy Item-Item Collaborative Filtering, and Hybrid Fusion.
          </p>
        </div>
        <div className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
          Offline Ranking Metrics
        </div>
      </div>

      {/* Benchmark Experiment Setup */}
      <form onSubmit={handleRunBenchmark} className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tournament Parameters
          </h2>
          <span className="text-xs text-slate-400">Multi-Model Battle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Dataset *</label>
            <select
              value={selectedProductDs}
              onChange={(e) => setSelectedProductDs(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="ds_default_products">Global Retail Catalogue (P101-P403)</option>
              {datasets.filter(d => d.dataset_id !== 'ds_default_products').map(d => (
                <option key={d.dataset_id} value={d.dataset_id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Stream *</label>
            <select
              value={selectedInterDs}
              onChange={(e) => setSelectedInterDs(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="ds_default_interactions">Omnichannel Customer Stream (500+ events)</option>
              {interactionDatasets.filter(d => d.dataset_id !== 'ds_default_interactions').map(d => (
                <option key={d.dataset_id} value={d.dataset_id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Top-K Cutoff</label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-blue-600 cursor-pointer"
            >
              <option value="5">Top 5 (@5)</option>
              <option value="10">Top 10 (@10)</option>
              <option value="15">Top 15 (@15)</option>
              <option value="20">Top 20 (@20)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Evaluation Split</label>
            <select
              value={splitStrategy}
              onChange={(e) => setSplitStrategy(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="user_holdout">Per-User Holdout (Last 20%)</option>
              <option value="temporal">Temporal Split (Time-Ordered)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Comparing: <span className="text-blue-600 font-semibold">Content-Based</span> • <span className="text-emerald-600 font-semibold">Item-Item</span> • <span className="text-purple-600 font-semibold">Hybrid Fusion</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Simulating Offline Trials...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Run Tournament</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Benchmark Results */}
      {benchmarkResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-blue-200 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Trophy className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-600 font-mono">Champion Model</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{benchmarkResult.best_algorithm_overall}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluated across {benchmarkResult.total_evaluated_users} test profiles ({benchmarkResult.total_test_interactions} test ground truth interactions) in {benchmarkResult.execution_duration_sec}s
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Best NDCG@K</span>
                <span className="font-bold text-blue-600 text-sm font-mono">{benchmarkResult.best_by_metric?.ndcg_at_k?.split(' ')[0]}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px]">Best Coverage</span>
                <span className="font-bold text-emerald-600 text-sm font-mono">{benchmarkResult.best_by_metric?.catalog_coverage?.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Charts */}
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ranking Quality & Accuracy Telemetry (%)</h3>
                <p className="text-xs text-slate-500">Precision@K, Recall@K, NDCG@K, Diversity, and Catalog Coverage</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="fullName" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    formatter={(val) => [`${val}%`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', color: '#0F172A', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="NDCG@K" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Precision@K" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Recall@K" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Catalog Coverage" fill="#F97316" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Diversity" fill="#EC4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Metrics Table */}
          <div className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Complete Scorecard Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Algorithm Strategy</th>
                    <th className="py-3 px-4">NDCG@{topK}</th>
                    <th className="py-3 px-4">Precision@{topK}</th>
                    <th className="py-3 px-4">Recall@{topK}</th>
                    <th className="py-3 px-4">F1@{topK}</th>
                    <th className="py-3 px-4">MAP@{topK}</th>
                    <th className="py-3 px-4">Coverage</th>
                    <th className="py-3 px-4">Diversity</th>
                    <th className="py-3 px-4">Build</th>
                    <th className="py-3 px-4">Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benchmarkResult.results.map((r) => (
                    <tr key={r.algorithm_name} className="hover:bg-slate-50/70 font-medium transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {r.display_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-600 font-bold">
                        {r.metrics.ndcg_at_k.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                        {r.metrics.precision_at_k.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-600">
                        {r.metrics.recall_at_k.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {r.metrics.f1_at_k.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {r.metrics.map_at_k.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                        {Math.round(r.metrics.catalog_coverage * 100)}%
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-500">
                        {r.metrics.diversity.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {r.metrics.model_build_time_ms.toFixed(1)}ms
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {r.metrics.execution_time_ms.toFixed(1)}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
