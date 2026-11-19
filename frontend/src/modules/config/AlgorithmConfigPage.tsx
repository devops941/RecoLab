import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Save,
  CheckCircle2,
  Sparkles,
  GitCompare,
  Layers,
  Info,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AlgorithmConfigPage: React.FC = () => {
  const [config, setConfig] = useState({
    topK: 10,
    similarityThreshold: 0.15,
    maxFeatures: 5000,
    ngramRange: '1-2',
    minDf: 1,
    maxDf: 0.95,
    contentWeight: 0.5,
    interactionWeight: 0.5,
    viewWeight: 1.0,
    clickWeight: 1.5,
    cartWeight: 3.0,
    purchaseWeight: 5.0,
    wishlistWeight: 2.5
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('recolab_algo_config', JSON.stringify(config));
    toast.success('Algorithm hyperparameter profile calibrated & saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Algorithm Hyperparameters & Tuning
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Calibrate vector vocabulary cutoffs, stopword bounds, interaction event graph weights, and composite hybrid fusion exponents.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Calibration</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        {/* Section 1: Content-Based Tuning */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>1. Content-Based TF-IDF Vectorizer Bounds</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Max Vocabulary Features</label>
              <input
                type="number"
                value={config.maxFeatures}
                onChange={(e) => setConfig({ ...config, maxFeatures: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 5,000 sublinear dimensions</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-700 mb-2">N-Gram Extraction Range</label>
              <select
                value={config.ngramRange}
                onChange={(e) => setConfig({ ...config, ngramRange: e.target.value })}
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="1-1">Unigrams Only (1, 1)</option>
                <option value="1-2">Unigrams + Bigrams (1, 2) [Recommended]</option>
                <option value="1-3">Unigrams to Trigrams (1, 3)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Multi-token compound capture</p>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Min Document Frequency (min_df)</label>
              <input
                type="number"
                value={config.minDf}
                onChange={(e) => setConfig({ ...config, minDf: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Prune tokens appearing &lt; N items</p>
            </div>
          </div>
        </div>

        {/* Section 2: Item-Item Event Weighting */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-emerald-600" />
            <span>2. Customer Interaction Event Multipliers</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Page View (weight)</label>
              <input
                type="number"
                step="0.1"
                value={config.viewWeight}
                onChange={(e) => setConfig({ ...config, viewWeight: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800"
              />
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Click (weight)</label>
              <input
                type="number"
                step="0.1"
                value={config.clickWeight}
                onChange={(e) => setConfig({ ...config, clickWeight: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800"
              />
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Add to Cart (weight)</label>
              <input
                type="number"
                step="0.5"
                value={config.cartWeight}
                onChange={(e) => setConfig({ ...config, cartWeight: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800"
              />
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Purchase (weight)</label>
              <input
                type="number"
                step="0.5"
                value={config.purchaseWeight}
                onChange={(e) => setConfig({ ...config, purchaseWeight: Number(e.target.value) })}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Hybrid Fusion Calibration */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>3. Hybrid Composite Score Fusion Balancing</span>
          </h3>
          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-600">Content-Based (TF-IDF): {(config.contentWeight * 100).toFixed(0)}%</span>
              <span className="text-purple-600">Collaborative (Interactions): {(config.interactionWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.contentWeight}
              onChange={(e) => {
                const cw = Number(e.target.value);
                setConfig({ ...config, contentWeight: cw, interactionWeight: Number((1 - cw).toFixed(2)) });
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-slate-500">
              Formula: <span className="font-semibold text-slate-800">S_hybrid</span> = ({config.contentWeight} × S_content) + ({config.interactionWeight} × S_collab)
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
