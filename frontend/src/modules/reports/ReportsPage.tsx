import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ReportsApi } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCheck,
  Play,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Generation form
  const [reportType, setReportType] = useState('full');
  const [format, setFormat] = useState('pdf');
  const [title, setTitle] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await ReportsApi.list(30);
      setReports(res.data);
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await ReportsApi.generate({
        dataset_id: activeDataset,
        report_type: reportType,
        format,
        title: title || undefined
      });
      toast.success(`Generated ${res.data.title}!`);
      setTitle('');
      fetchReports();
    } catch (err: any) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Reports & Analytical Exports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Generate publication-ready PDF reports with RecoLab branding, styled Excel workbooks, and raw CSV telemetry.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Archive</span>
        </button>
      </div>

      {/* Report Generator Box */}
      <form onSubmit={handleGenerate} className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Generate New Analytical Dossier
          </h2>
          <span className="text-xs text-slate-400">Export Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Subject & Scope *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
            >
              <option value="full">Complete Business Insights & Strategy (All-In-One)</option>
              <option value="catalogue">Product Catalogue & Similarity Report</option>
              <option value="benchmark">Algorithm Benchmarking & Quality Evaluation</option>
              <option value="behaviour">Customer Behaviour & Journey Report</option>
              <option value="price">Price Distribution & Margin Analysis</option>
              <option value="demand">Demand Velocity & Momentum Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Export Format *</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-blue-600"
            >
              <option value="pdf">Publication PDF (.pdf) [ReportLab Engine]</option>
              <option value="excel">Excel Workbook (.xlsx) [OpenPyXL Engine]</option>
              <option value="csv">Raw Comma-Separated (.csv)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Q4 Executive Algorithm Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Compiling Dossier...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Compile & Export Report</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reports Archive */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Archived Intelligence Reports
          </h2>
          <span className="text-xs text-slate-500">{reports.length} Reports Archived</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">Loading report repository...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No reports compiled yet. Click above to generate your first dossier!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Report Title</th>
                  <th className="py-3 px-4">Subject Scope</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50/70 transition-colors font-medium">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{r.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 uppercase text-[11px] font-mono">{r.report_type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        r.format === 'pdf' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        r.format === 'excel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {r.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{r.created_at?.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={ReportsApi.downloadUrl(r.report_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-xs border border-slate-200/80 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
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
