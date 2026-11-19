import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsApi } from '../../services/api';
import { DashboardData } from '../../types';
import {
  LineChart as LineChartIcon,
  ShoppingCart,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const BehaviourAnalysisPage: React.FC = () => {
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
        console.error('Failed to load behaviour analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDataset]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-sans text-xs animate-pulse">
        Loading Product Behaviour Analytics...
      </div>
    );
  }

  const behaviour = data?.behaviour;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Funnel Telemetry • Customer Journey Mapping</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Product Behaviour & <span className="text-blue-600">Funnel Dynamics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Trace consumer decision journeys from initial impression to final purchase and identify friction points in the conversion funnel.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
            ● {behaviour?.conversion_rate_percent || 0}% Conversion Rate
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversion Efficiency</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">{behaviour?.conversion_rate_percent || 0}%</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Purchases vs Total Session Events</span>
        </div>

        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cart Abandonment Estimate</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">{behaviour?.cart_abandonment_estimate_percent || 0}%</p>
          <span className="text-xs text-rose-600 font-semibold mt-1 inline-block">Unconverted Add-to-Cart events</span>
        </div>

        <div className="studio-card p-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Interaction Volume</span>
          <p className="text-3xl font-extrabold text-[#0B0F19] mt-2">{data?.kpis.total_interactions || 0}</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">Recorded telemetry touchpoints</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <div className="studio-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Top Products by Views & Impressions</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behaviour?.top_viewed_products || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
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
                <Bar dataKey="value" name="Views" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Purchased Products */}
        <div className="studio-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Top Products by Verified Purchases</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behaviour?.top_purchased_products || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
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
                <Bar dataKey="value" name="Purchases" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
