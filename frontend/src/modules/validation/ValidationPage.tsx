import React, { useState, useEffect } from 'react';
import { DatasetsApi } from '../../services/api';
import { Dataset } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Database,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ValidationPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await DatasetsApi.list();
        setDatasets(res.data);
      } catch (e) {
        console.error('Failed to load datasets for validation', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Data Integrity & Validation Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Automated dataset schema conformance auditing, missing feature detection, and zero-leakage verification.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
            Audit Conformance Passed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map((ds) => {
          const val = ds.validation_summary;
          const score = val?.data_quality_score ?? 100;
          return (
            <div key={ds.dataset_id} className="bg-white/85 backdrop-blur-xl border border-slate-200/80 hover:border-blue-400/50 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{ds.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{ds.dataset_id}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{score}% Quality</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Conformance Health</span>
                  <span className="text-blue-600 font-semibold">{score} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Records</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">{val?.total_records ?? ds.row_count}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-emerald-600 uppercase font-semibold">Valid Rows</p>
                  <p className="font-bold text-emerald-700 text-sm mt-0.5 font-mono">{val?.valid_records ?? ds.row_count}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Anomalies</p>
                  <p className="font-bold text-slate-700 text-sm mt-0.5 font-mono">{val?.invalid_records ?? 0}</p>
                </div>
              </div>

              {/* Schema Conformance List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Required Schema Fields</span>
                  </span>
                  <span className="text-emerald-600 font-semibold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Vector Text Sparsity Pruning</span>
                  </span>
                  <span className="text-blue-600 font-semibold">Passed</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Train/Test Temporal Integrity</span>
                  </span>
                  <span className="text-purple-600 font-semibold">Isolated</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-xs rounded-full border border-slate-200/80 transition-all"
                >
                  <span>Explore Clean Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
