import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsApi } from '../../services/api';
import { DashboardData } from '../../types';
import {
  DollarSign,
  Tag,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export const PriceAnalysisPage: React.FC = () => {
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
        console.error('Failed to load price analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDataset]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-sans text-xs animate-pulse">
        Loading Price Sensitivity Analytics...
      </div>
    );
  }

  const price = data?.price;
  const BAR_COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#F97316'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Pricing Telemetry • Tiering & Elasticity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Price Sensitivity & <span className="text-blue-600">Affinity Dynamics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Evaluate catalogue pricing brackets, brand tiering, and affinity correlations between price bands and interaction volumes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-2xs">
            Avg ${(price?.average_price || 0).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mean Price</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">${(price?.average_price || 0).toFixed(2)}</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">Catalog arithmetic mean</span>
        </div>

        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Median Price</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">${(price?.median_price || 0).toFixed(2)}</p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">50th percentile midpoint</span>
        </div>

        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Min Price Floor</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">${(price?.min_price || 0).toFixed(2)}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Entry-level catalogue item</span>
        </div>

        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Price Ceiling</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">${(price?.max_price || 0).toFixed(2)}</p>
          <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">Ultra-premium tier item</span>
        </div>
      </div>

      {/* Price Tiers Distribution Chart */}
      <div className="studio-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Catalogue Segmentation by Price Tier</h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
            Histogram Buckets
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={price?.price_distribution_buckets || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  color: '#0F172A'
                }}
              />
              <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]}>
                {(price?.price_distribution_buckets || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
