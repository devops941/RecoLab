import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProductsApi, RecommendationsApi } from '../../services/api';
import { Product, RecommendationResponse } from '../../types';
import {
  Search,
  Sparkles,
  GitCompare,
  Layers,
  Play,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RecommendationExplorerPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [topK, setTopK] = useState<number>(5);

  const [loading, setLoading] = useState(false);
  const [cbResult, setCbResult] = useState<RecommendationResponse | null>(null);
  const [iiResult, setIiResult] = useState<RecommendationResponse | null>(null);
  const [hybridResult, setHybridResult] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('productId');

    const loadProducts = async () => {
      try {
        const res = await ProductsApi.list({ dataset_id: activeDataset, page: 1, page_size: 50 });
        setProducts(res.data.items);
        if (pid) {
          setSelectedProductId(pid);
        } else if (res.data.items.length > 0 && !selectedProductId) {
          setSelectedProductId(res.data.items[0].product_id);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    loadProducts();
  }, [activeDataset, location.search]);

  const handleCompareAll = async () => {
    if (!selectedProductId) {
      toast.error('Select a product to explore');
      return;
    }

    setLoading(true);
    try {
      const [cbRes, iiRes, hyRes] = await Promise.all([
        RecommendationsApi.contentBased({
          dataset_id: activeDataset,
          product_id: selectedProductId,
          top_k: topK,
          similarity_threshold: 0.0
        }),
        RecommendationsApi.itemItem({
          dataset_id: activeDataset,
          product_id: selectedProductId,
          top_k: topK,
          similarity_threshold: 0.0
        }),
        RecommendationsApi.hybrid({
          dataset_id: activeDataset,
          product_id: selectedProductId,
          top_k: topK,
          similarity_threshold: 0.0,
          content_weight: 0.5,
          interaction_weight: 0.5
        })
      ]);

      setCbResult(cbRes.data);
      setIiResult(iiRes.data);
      setHybridResult(hyRes.data);
      toast.success('Generated 3-way algorithmic comparison!');
    } catch (err: any) {
      toast.error('Failed to fetch full comparison');
    } finally {
      setLoading(false);
    }
  };

  const selectedProd = products.find(p => p.product_id === selectedProductId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">3-Way Algorithmic Arena • Multi-Strategy Evaluator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Recommendation <span className="text-blue-600">Matrix Explorer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Side-by-side 3-way telemetry comparing Content-Based (TF-IDF), Collaborative (Item-Item), and Hybrid models simultaneously for identical input products.
          </p>
        </div>
      </div>

      {/* Product Selection Bar */}
      <div className="studio-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Choose Seed Product to Compare *</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-slate-900 cursor-pointer font-medium transition-all"
          >
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                [{p.product_id}] {p.product_name} • ${p.price} ({p.category})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Top-K Items</label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-[#2563EB] text-slate-900 font-semibold cursor-pointer"
            >
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
            </select>
          </div>

          <button
            onClick={handleCompareAll}
            disabled={loading}
            className="mt-5 studio-button-blue px-6 py-2.5 rounded-full inline-flex items-center space-x-2 text-xs font-semibold shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run 3-Way Comparison</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Product Hero Card */}
      {selectedProd && (
        <div className="studio-card p-5 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            <img
              src={selectedProd.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
              alt={selectedProd.product_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                {selectedProd.category}
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">ID: {selectedProd.product_id}</span>
            </div>
            <h2 className="text-base font-bold text-[#0B0F19] mt-1">{selectedProd.product_name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{selectedProd.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <span className="font-extrabold text-[#0B0F19] text-base">${Number(selectedProd.price).toFixed(2)}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Brand: {selectedProd.brand}</span>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Columns */}
      {(cbResult || iiResult || hybridResult) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content-Based Column */}
          <div className="studio-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-blue-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>1. Content-Based TF-IDF</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-white border border-blue-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  {cbResult?.execution_time_ms}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">TF-IDF semantic catalogue attribute similarity</p>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-white">
              {cbResult?.recommendations.map((r) => (
                <div key={r.product_id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate pr-2">#{r.rank} {r.product_name}</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                      {(r.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{r.category}</span>
                    <span className="font-bold text-slate-900">${r.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">{r.explanation.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Item-Item Column */}
          <div className="studio-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-indigo-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1.5">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  <span>2. Collaborative (Item-Item)</span>
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-white border border-indigo-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  {iiResult?.execution_time_ms}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Sparse customer co-purchase & interaction vectors</p>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-white">
              {iiResult?.recommendations.map((r) => (
                <div key={r.product_id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate pr-2">#{r.rank} {r.product_name}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                      {(r.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{r.category}</span>
                    <span className="font-bold text-slate-900">${r.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">{r.explanation.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hybrid Column */}
          <div className="studio-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-purple-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>3. Hybrid Blend</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-white border border-purple-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  {hybridResult?.execution_time_ms}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Optimal 50% Content + 50% Interaction fusion</p>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-white">
              {hybridResult?.recommendations.map((r) => (
                <div key={r.product_id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate pr-2">#{r.rank} {r.product_name}</span>
                    <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-[11px]">
                      {(r.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{r.category}</span>
                    <span className="font-bold text-slate-900">${r.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">{r.explanation.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
