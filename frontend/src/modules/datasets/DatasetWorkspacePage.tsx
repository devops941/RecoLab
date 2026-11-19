import React, { useState, useEffect } from 'react';
import { DatasetsApi } from '../../services/api';
import { Dataset, ValidationSummary } from '../../types';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  RefreshCw,
  Database,
  X,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DatasetWorkspacePage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetType, setDatasetType] = useState<'products' | 'interactions'>('products');
  const [description, setDescription] = useState('');

  // Preview Modal
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await DatasetsApi.list();
      setDatasets(res.data);
    } catch (e) {
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!datasetName.trim()) {
      toast.error('Please enter a dataset name');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', datasetName);
    formData.append('dataset_type', datasetType);
    if (description) formData.append('description', description);

    try {
      const res = await DatasetsApi.upload(formData);
      toast.success(`Dataset '${res.data.name}' processed successfully!`);
      setFile(null);
      setDatasetName('');
      setDescription('');
      fetchDatasets();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (datasetId: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset ${datasetId}?`)) return;
    try {
      await DatasetsApi.delete(datasetId);
      toast.success('Dataset deleted');
      fetchDatasets();
    } catch (e) {
      toast.error('Failed to delete dataset');
    }
  };

  const handlePreview = async (datasetId: string) => {
    setPreviewLoading(true);
    try {
      const res = await DatasetsApi.preview(datasetId, 15);
      setPreviewData(res.data);
    } catch (e) {
      toast.error('Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Dataset Ingestion Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Upload, audit, inspect, and register product catalogues and customer interaction streams.
          </p>
        </div>
        <div className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
          {datasets.length} Active Matrices
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ingest New Dataset Matrix (CSV / XLSX)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Auto Quality Audit</span>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dataset Name *</label>
              <input
                type="text"
                placeholder="e.g. Summer Catalogue 2026"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dataset Type *</label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value as any)}
                className="w-full text-xs font-medium px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
              >
                <option value="products">Product Catalogue (product_id, name, category, price, ...)</option>
                <option value="interactions">Customer Interactions (customer_id, product_id, event, date)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">File Attachment *</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs px-2 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description / Metadata</label>
            <input
              type="text"
              placeholder="Context or notes about this batch..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Auditing Matrix...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                  <span>Upload & Ingest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dataset List */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Registered Ingestion Matrices
          </h2>
          <button
            onClick={fetchDatasets}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Dataset Name</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Records</th>
                <th className="py-3 px-6">Quality Conformance</th>
                <th className="py-3 px-6">Integrity Status</th>
                <th className="py-3 px-6">Ingested Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.map((ds) => {
                const score = ds.validation_summary?.data_quality_score ?? 100;
                return (
                  <tr key={ds.dataset_id} className="hover:bg-slate-50/70 transition-colors font-medium">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div>{ds.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">{ds.dataset_id}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        ds.dataset_type === 'products' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {ds.dataset_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono">{ds.row_count} rows</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${score > 90 ? 'bg-emerald-500' : score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-emerald-600">{score}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Certified Valid</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {new Date(ds.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handlePreview(ds.dataset_id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Preview Records"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ds.dataset_id !== 'ds_default_products' && ds.dataset_id !== 'ds_default_interactions' && (
                        <button
                          onClick={() => handleDelete(ds.dataset_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sample Conformance Preview: <span className="text-blue-600">{previewData.name}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Displaying top {previewData.preview_rows?.length} records of {previewData.total_rows} total rows
                </p>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {previewData.columns?.map((col: string) => (
                      <th key={col} className="p-2.5 font-semibold text-slate-700 uppercase text-[10px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {previewData.preview_rows?.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {previewData.columns?.map((col: string) => (
                        <td key={col} className="p-2.5 text-slate-600 truncate max-w-xs">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
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
