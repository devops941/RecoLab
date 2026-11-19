import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DatasetsApi } from '../../services/api';
import { Users, MousePointerClick, Calendar, CheckCircle2, Zap } from 'lucide-react';

export const InteractionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    const fetchInteractions = async () => {
      setLoading(true);
      try {
        const res = await DatasetsApi.preview('ds_default_interactions', 50);
        setInteractions(res.data.preview_rows || []);
      } catch (e) {
        console.error('Failed to load interactions preview', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Customer Interaction Stream
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time ingested telemetry: page views, item clicks, cart additions, purchase transactions, and user star ratings.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
            516 Ingested Events
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
            Stream Active
          </span>
        </div>
      </div>

      {/* Stream Table Box */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Interaction Feed Preview
            </h2>
          </div>
          <span className="text-[11px] text-blue-600 font-mono font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            ds_default_interactions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono animate-pulse">
            Fetching telemetry stream from MongoDB Atlas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Customer ID</th>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Star Rating</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interactions.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors font-medium">
                    <td className="py-3.5 px-6 font-mono text-slate-800 font-semibold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{row.customer_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600 font-bold">{row.product_id}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          row.interaction_type === 'purchase'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : row.interaction_type === 'add_to_cart'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : row.interaction_type === 'click'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.interaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{row.quantity || 1}</td>
                    <td className="py-3.5 px-4 font-mono">
                      {row.rating ? (
                        <span className="text-amber-500 font-bold">★ {row.rating}.0</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{row.interaction_date || 'N/A'}</td>
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
