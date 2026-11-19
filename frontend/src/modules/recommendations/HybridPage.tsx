import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProductsApi, RecommendationsApi } from '../../services/api';
import { Product, RecommendationResponse } from '../../types';
import {
  Layers,
  Sparkles,
  Users,
  Play,
  Info,
  RefreshCw,
  Scale,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HybridPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [contentWeight, setContentWeight] = useState<number>(0.5);
  const [topK, setTopK] = useState<number>(6);
  const [threshold, setThreshold] = useState<number>(0.05);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await ProductsApi.list({ dataset_id: activeDataset, page: 1, page_size: 50 });
        setProducts(res.data.items);
        if (res.data.items.length > 0 && !selectedProductId) {
          setSelectedProductId(res.data.items[0].product_id);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    loadProducts();
  }, [activeDataset]);

  const interactionWeight = Math.round((1.0 - contentWeight) * 100) / 100;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select an anchor product');
      return;
    }

    setLoading(true);
    try {
      const res = await RecommendationsApi.hybrid({
        dataset_id: activeDataset,
        product_id: selectedProductId,
        top_k: topK,
        similarity_threshold: threshold,
        content_weight: contentWeight,
        interaction_weight: interactionWeight
      });
      setResult(res.data);
      toast.success(`Generated ${res.data.recommendations.length} hybrid recommendations!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Multi-Model Score Fusion • Dual Engine Blending</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Hybrid Multi-Model <span className="text-purple-600">Fusion Engine</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Dynamically synthesizes Content-Based semantic vectors with Collaborative behavioral co-occurrence patterns into a single weighted affinity score.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200/80 px-4 py-2 rounded-full text-xs font-semibold text-purple-700 shadow-2xs">
          <Scale className="w-4 h-4 text-purple-600" />
          <span>Balanced Score Blending</span>
        </div>
      </div>

      {/* Control Configuration Panel */}
      <form onSubmit={handleGenerate} className="studio-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
          <span>Fusion Weights & Seed Selection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Anchor Product Query *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-slate-900 cursor-pointer font-medium transition-all"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.product_id}] {p.product_name} • ${p.price} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Top-K Items</label>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{topK}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Weight Ratio Slider */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-blue-700 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Content Weight: {Math.round(contentWeight * 100)}%</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-700 font-bold">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Fusion Balancing Ratio</span>
            </span>
            <span className="flex items-center space-x-1.5 text-indigo-700 font-bold">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Collaborative Weight: {Math.round(interactionWeight * 100)}%</span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={contentWeight}
            onChange={(e) => setContentWeight(Number(e.target.value))}
            className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span className="text-blue-600 font-semibold">100% Content (Cold-start Safe)</span>
            <span className="text-slate-600">Balanced 50/50 Multi-Model</span>
            <span className="text-indigo-600 font-semibold">100% Collaborative (Behavioral)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100 gap-4">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <Info className="w-4 h-4 text-purple-500" />
            <span>Fused Score = ({Math.round(contentWeight * 100)}% × TF-IDF) + ({Math.round(interactionWeight * 100)}% × Collaborative Matrix)</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="studio-button-blue px-6 py-2.5 rounded-full inline-flex items-center justify-center space-x-2 text-xs font-semibold shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Hybrid Blend...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Hybrid Model</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="studio-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-700 gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900">Anchor Reference Product:</span>
              <span className="font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                {result.source_product.product_name}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-600 font-medium">
              <span>Compute Latency: <strong className="text-slate-900 font-semibold">{result.execution_time_ms}ms</strong></span>
              <span>•</span>
              <span>Fusion Outputs: <strong className="text-purple-600 font-semibold">{result.total_recommendations} items</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.recommendations.map((rec) => (
              <div
                key={rec.product_id}
                className="studio-card p-5 flex flex-col justify-between group hover:border-purple-300 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white tracking-wide">
                      Rank #{rec.rank}
                    </span>
                    <div className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                      {(rec.similarity_score * 100).toFixed(1)}% Hybrid Score
                    </div>
                  </div>

                  <div className="h-36 bg-slate-100 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={rec.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                      alt={rec.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-medium">
                      {rec.product_id}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wide">
                    {rec.brand} • {rec.category}
                  </div>
                  <h3 className="text-sm font-bold text-[#0B0F19] mt-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {rec.product_name}
                  </h3>
                  <p className="text-lg font-extrabold text-[#0B0F19] mt-1">${rec.price.toFixed(2)}</p>

                  {/* Component Score Decomposition */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
                    <span className="text-slate-800 text-[11px] font-bold block">
                      Score Telemetry Decomposition:
                    </span>
                    <div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                        <span>Content Affinity (TF-IDF)</span>
                        <span className="text-blue-600 font-bold">{rec.content_score ?? 0}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (rec.content_score ?? 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                        <span>Collaborative Affinity</span>
                        <span className="text-indigo-600 font-bold">{rec.interaction_score ?? 0}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (rec.interaction_score ?? 0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-slate-500 text-[11px] leading-relaxed">
                      <strong className="text-slate-800 font-semibold">Synthesis: </strong>
                      {rec.explanation.summary}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
