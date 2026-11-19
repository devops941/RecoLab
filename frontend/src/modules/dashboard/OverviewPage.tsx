import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsApi } from '../../services/api';
import { DashboardData } from '../../types';
import {
  ShoppingBag,
  Users,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  Lightbulb,
  ExternalLink,
  Flame,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';

const STUDIO_PALETTE = ['#2563EB', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];

export const OverviewPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await AnalyticsApi.getDashboard(activeDataset);
        setData(res.data);
      } catch (e) {
        console.error('Failed to load dashboard analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDataset]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white/60 rounded-3xl w-full border border-slate-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/60 rounded-2xl border border-slate-200"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white/60 rounded-2xl border border-slate-200"></div>
          <div className="h-80 bg-white/60 rounded-2xl border border-slate-200"></div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const avgDensity = kpis && kpis.total_customers > 0 ? (kpis.total_interactions / kpis.total_customers).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Hero Section (Faithfully Designed after microdose.studio) */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-white/75 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        {/* Soft Ambient Ethereal Glow */}
        <div className="absolute top-0 right-0 w-[450px] h-[350px] bg-gradient-to-bl from-blue-100/50 via-purple-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[250px] bg-gradient-to-tr from-amber-100/50 via-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Status Capsule Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#0F172A] text-white text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-medium tracking-tight">Accepting recommendation evaluations</span>
          </div>

          {/* Subheading */}
          <p className="text-sm font-semibold text-slate-500 tracking-tight">
            Your Recommendation & Discovery Partner.
          </p>

          {/* Main Studio Headline */}
          <h1 className="text-4xl sm:text-5xl font-black text-[#0B0F19] tracking-tight leading-[1.12]">
            We build AI-first recommendation intelligence for commerce & retail.
          </h1>

          {/* Lead Paragraph */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
            RecoLab shapes your product discovery strategies, benchmarks multi-attribute algorithms, and delivers offline tournament precision with zero data leakage.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/benchmarking"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Run Benchmark Arena</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
            <Link
              to="/recommendations/explorer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200/90 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Explore 3-Way Matrix</span>
            </Link>
          </div>

          {/* Partner & Tech Stack Row (Inspired by microdose.studio logo footer) */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
            <span className="text-slate-500 font-semibold">Engine Stack:</span>
            <span className="hover:text-slate-700 transition-colors">Scikit-learn</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors">SciPy CSR Sparse</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors">TF-IDF N-Grams</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors">Pairwise Cosine</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors">MongoDB Atlas</span>
          </div>
        </div>
      </div>

      {/* KPI Cards: Luminous, Clean, High-End Studio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-blue-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalogue Items</span>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis?.total_products || 0}</span>
            <span className="text-xs font-semibold text-blue-600">Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            100% feature vector coverage
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-emerald-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Profiles</span>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis?.total_customers || 0}</span>
            <span className="text-xs font-semibold text-emerald-600">Users</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {kpis?.total_interactions || 0} interaction touchpoints
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interaction Stream</span>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis?.total_interactions || 0}</span>
            <span className="text-xs font-semibold text-purple-600">Events</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {avgDensity} events per customer
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-amber-400/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Price</span>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">${(kpis?.average_product_price || 0).toFixed(2)}</span>
            <span className="text-xs font-semibold text-amber-600">USD</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Across {kpis?.total_categories || 0} categories
          </p>
        </div>
      </div>

      {/* Main Charts Grid: Clean, Ethereal Studio Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Interaction Event Breakdown */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Interaction Event Taxonomy</span>
              </h2>
              <p className="text-xs text-slate-500">Distribution of user sessions across interaction touchpoints</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Telemetry
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.behaviour?.interaction_type_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', color: '#0F172A', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {(data?.behaviour?.interaction_type_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STUDIO_PALETTE[index % STUDIO_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Category Affinity Distribution</span>
              </h2>
              <p className="text-xs text-slate-500">Customer engagement distribution across inventory segments</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              Affinity
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.behaviour?.category_engagement || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {(data?.behaviour?.category_engagement || []).map((_, index) => (
                    <Cell key={`pie-cell-${index}`} fill={STUDIO_PALETTE[index % STUDIO_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', color: '#0F172A', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Products Leaderboard & Prescriptive Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Interacted Products */}
        <div className="lg:col-span-2 bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Highest-Velocity Catalogue Items</span>
              </h2>
              <p className="text-xs text-slate-500">Products generating maximum recommendation affinity</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(data?.behaviour?.top_viewed_products || []).slice(0, 5).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-all group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {p.name}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      High-Velocity Engagement Tier
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 font-mono">{p.value} Hits</span>
                  <Link
                    to="/recommendations/explorer"
                    className="p-1.5 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-500 border border-slate-200 transition-all shadow-sm"
                    title="Inspect Similarity Matrix"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptive Directives Panel */}
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-7 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Prescriptive Directives</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
              AI Insights
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border-l-4 border-l-blue-600 border border-slate-200/60">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">High-Affinity Cross Selling</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Collaborative filtering captures strong bundling between audio and accessories. Recommend hybrid model with 0.6 CF weight.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border-l-4 border-l-purple-600 border border-slate-200/60">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">Cold-Start Catalog Handling</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Newly ingested items without user interactions leverage content-based TF-IDF multi-attribute fallback seamlessly.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border-l-4 border-l-emerald-600 border border-slate-200/60">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Zero Data Leakage Conformance</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Offline evaluation pipeline strictly isolates train and test splits per user holdout, ensuring zero evaluation target contamination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
