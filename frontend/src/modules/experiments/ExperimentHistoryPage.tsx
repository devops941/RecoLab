import React, { useEffect, useState } from 'react';
import { BenchmarkingApi } from '../../services/api';
import {
  History,
  BarChart3,
  Award,
  Clock,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExperimentHistoryPage: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await BenchmarkingApi.listExperiments(30);
      setExperiments(res.data);
    } catch (e) {
      console.error('Failed to load experiment history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Experiment Audit Vault • Reproducible Science</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Experiment Vault & <span className="text-blue-600">History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Auditable registry of offline recommendation model trials, hyperparameter runs, and tournament evaluation benchmarks.
          </p>
        </div>

        <Link
          to="/benchmarking"
          className="studio-button-blue px-5 py-2.5 rounded-full inline-flex items-center space-x-2 text-xs font-semibold shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Launch New Tournament</span>
        </Link>
      </div>

      <div className="studio-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Executed Benchmark Trials ({experiments.length})
            </h2>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">
            100% Auditable
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-sans text-xs animate-pulse">
            Loading historical runs...
          </div>
        ) : experiments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-sans text-xs">
            No experiments recorded yet. Head over to Algorithm Benchmarking Arena to run your first trial.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Experiment Title</th>
                  <th className="py-3.5 px-4">Dataset ID</th>
                  <th className="py-3.5 px-4">Winner Model</th>
                  <th className="py-3.5 px-4">Evaluation Strategy</th>
                  <th className="py-3.5 px-4">Compute Latency</th>
                  <th className="py-3.5 px-4">Recorded Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {experiments.map((exp) => (
                  <tr key={exp.experiment_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900">{exp.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{exp.dataset_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {exp.winner_model || 'Hybrid Model'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {exp.split_strategy || 'User Holdout (80/20)'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {(exp.execution_time_seconds || 0).toFixed(3)}s
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {exp.created_at?.slice(0, 19).replace('T', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
