import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DatasetsApi } from '../../services/api';
import { Dataset } from '../../types';
import { ThemeSelector } from '../common/ThemeSelector';
import {
  Search,
  Database,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Play,
  Compass
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ collapsed, onToggleSidebar }) => {
  const { user, logout, activeDataset, setActiveDataset } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await DatasetsApi.list();
        setDatasets(res.data);
      } catch (e) {
        console.error('Failed to load datasets for selector', e);
      }
    };
    fetchDatasets();
  }, []);

  const getPageInfo = (path: string) => {
    if (path === '/') return { section: 'Platform', title: 'Executive Overview' };
    if (path.includes('dataset')) return { section: 'Workspace', title: 'Dataset Hub' };
    if (path.includes('product')) return { section: 'Workspace', title: 'Product Catalogue' };
    if (path.includes('interaction')) return { section: 'Workspace', title: 'Interaction Stream' };
    if (path.includes('validation')) return { section: 'Workspace', title: 'Quality Audit' };
    if (path.includes('content-based')) return { section: 'Engines', title: 'TF-IDF Content' };
    if (path.includes('item-item')) return { section: 'Engines', title: 'Item Collaborative' };
    if (path.includes('hybrid')) return { section: 'Engines', title: 'Hybrid Fusion' };
    if (path.includes('explorer')) return { section: 'Engines', title: 'Strategy Explorer' };
    if (path.includes('benchmarking')) return { section: 'Arena', title: 'Benchmark Arena' };
    if (path.includes('behaviour')) return { section: 'Analytics', title: 'Consumer Funnel' };
    if (path.includes('price')) return { section: 'Analytics', title: 'Price Elasticity' };
    if (path.includes('demand')) return { section: 'Analytics', title: 'Demand Velocity' };
    if (path.includes('insights')) return { section: 'Directives', title: 'Strategic Insights' };
    if (path.includes('algorithm-config')) return { section: 'Governance', title: 'Algorithm Tuning' };
    if (path.includes('experiments')) return { section: 'Governance', title: 'Experiment Vault' };
    if (path.includes('reports')) return { section: 'Governance', title: 'Reports & Exports' };
    if (path.includes('settings')) return { section: 'Governance', title: 'Platform Settings' };
    return { section: 'RecoLab', title: 'Studio Dashboard' };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <header className="h-16 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-2xl shadow-lg shadow-slate-200/30 px-5 sticky top-4 z-30 flex items-center justify-between transition-all">
      {/* Left: Active View Context Breadcrumb + Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        {/* Active Context Capsule */}
        <div className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs flex-shrink-0">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-400 font-medium text-[11px]">{pageInfo.section}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold tracking-tight text-[11px]">{pageInfo.title}</span>
        </div>

        {/* Global Spotlight Search */}
        <div className="relative w-full group">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-hover:text-blue-600" />
          <input
            type="text"
            placeholder="Quick search algorithms, datasets, telemetry..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400 font-medium shadow-2xs"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold text-slate-400 bg-white border border-slate-200/80 shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Studio Capsule Pill, Dataset Selector, Theme Selector, Action & Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Status Capsule Pill (Inspired by microdose.studio) */}
        <div className="hidden xl:inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 text-white text-xs font-medium shadow-sm border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium tracking-tight text-slate-200">Studio Live</span>
        </div>

        {/* Global Dataset Selector */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200/80 hover:border-slate-300 transition-colors px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
          <Database className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-slate-400 hidden sm:inline text-[11px] font-medium">Matrix:</span>
          <select
            value={activeDataset}
            onChange={(e) => setActiveDataset(e.target.value)}
            className="bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer text-xs pr-1"
          >
            <option value="ds_default_products">Retail Catalogue (P101-P403)</option>
            {datasets
              .filter(d => d.dataset_id !== 'ds_default_products' && d.dataset_type === 'products')
              .map((d) => (
                <option key={d.dataset_id} value={d.dataset_id}>
                  {d.name} ({d.row_count} items)
                </option>
              ))}
          </select>
        </div>

        {/* Theme Selector Dropdown */}
        <ThemeSelector />

        {/* Action Button: Royal Blue Pill */}
        <Link
          to="/benchmarking"
          className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>Run Arena</span>
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-white">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="hidden sm:block pr-1">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {user?.full_name?.split(' ')[0] || 'Researcher'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>{user?.role}</span>
                </div>
              </div>
              <div className="p-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
