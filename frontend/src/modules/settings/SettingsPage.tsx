import React from 'react';
import { Settings, ShieldCheck, Database, Server, Cpu, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Production Topology • Microservices Health</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Platform Architecture & <span className="text-blue-600">Infrastructure</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Live cluster connectivity, Python FastAPI microservices, and Scikit-learn sparse matrix acceleration engines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
            ● All Systems Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="studio-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              MongoDB Atlas Cluster Topology
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">Database Engine:</span>
              <span className="font-bold text-slate-900">MongoDB Atlas (v7.0+ Managed Cloud)</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">Primary Database:</span>
              <span className="font-bold text-blue-600 font-mono">recolab_db</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">Cluster Health:</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected & Healthy</span>
              </span>
            </div>
          </div>
        </div>

        <div className="studio-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Server className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Python 3 Backend Runtimes
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">API Framework:</span>
              <span className="font-bold text-slate-900">FastAPI + Motor (Async I/O)</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">Machine Learning:</span>
              <span className="font-bold text-purple-600">Scikit-learn + SciPy Sparse CSR</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 font-medium">Frontend Stack:</span>
              <span className="font-bold text-blue-600">React 18 + TypeScript + Vite + Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
