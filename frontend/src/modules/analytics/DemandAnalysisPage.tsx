import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsApi } from '../../services/api';
import { DashboardData } from '../../types';
import {
  TrendingUp,
  Calendar,
  Flame,
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

export const DemandAnalysisPage: React.FC = () => {
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
        console.error('Failed to load demand analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDataset]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-sans text-xs animate-pulse">
        Loading Demand Velocity Analytics...
      </div>
    );
  }

  const demand = data?.demand;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">Demand Cadence • Real-time Product Velocity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Demand Velocity & <span className="text-blue-600">Cadence Dynamics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Monitor interaction day cadence, identify fast-moving flagship items, and isolate high-velocity demand surges across the catalogue.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-2xs">
            ● Peak Surge Monitored
          </span>
        </div>
      </div>

      {/* Demand Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Cadence */}
        <div className="studio-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Weekly Interaction Cadence</h3>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Day Distribution
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demand?.weekly_demand_trends || []}>
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
                <Bar dataKey="value" name="Interactions" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Velocity Items */}
        <div className="studio-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Fast-Moving Velocity Products</h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
              Surge Leaders
            </span>
          </div>

          <div className="space-y-3">
            {(demand?.high_demand_products || []).slice(0, 5).map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-200 transition-all"
              >
                <div className="truncate pr-4">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Flagship Demand Surge Tier</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full">
                    {p.units} Units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
