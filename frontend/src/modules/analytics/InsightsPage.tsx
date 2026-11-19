import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsApi } from '../../services/api';
import { BusinessInsightItem } from '../../types';
import {
  Lightbulb,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InsightsPage: React.FC = () => {
  const { activeDataset } = useAuth();
  const [insights, setInsights] = useState<BusinessInsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await AnalyticsApi.getDashboard(activeDataset);
        setInsights(res.data.insights || []);
      } catch (e) {
        console.error('Failed to load insights', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDataset]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="studio-pill-badge mb-3 inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">AI Prescriptive Analytics • Merchandising Directives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F19] tracking-tight">
            Prescriptive Strategy & <span className="text-blue-600">Merchandising</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            Machine-generated commercial hypotheses and actionable merchandising interventions derived from offline evaluation and graph affinities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-2xs">
            ● Heuristic Engine Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-sans text-xs animate-pulse">
          Generating prescriptive insights...
        </div>
      ) : (
        <div className="space-y-5">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="studio-card p-6 sm:p-8 space-y-4 hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                    {ins.category}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                      ins.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                    }`}
                  >
                    {ins.priority} Priority
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">RecoLab Synthesis</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B0F19]">{ins.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ins.explanation}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-1.5">Evidence: {ins.supporting_data}</p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-4 border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Prescribed Operational Action:
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{ins.suggested_action}</p>
                  </div>
                </div>

                <Link
                  to="/benchmarking"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
                >
                  <span>Verify in Arena</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
