import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  ShoppingBag,
  Users,
  CheckCircle2,
  Sliders,
  Cpu,
  Sparkles,
  GitCompare,
  Search,
  Layers,
  LineChart,
  DollarSign,
  TrendingUp,
  BarChart3,
  Lightbulb,
  History,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Activity,
  Layers2
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Overview', path: '/', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Data Workspace',
    items: [
      { label: 'Dataset Hub', path: '/datasets', icon: Database },
      { label: 'Product Catalogue', path: '/products', icon: ShoppingBag },
      { label: 'Interaction Stream', path: '/interactions', icon: Users },
      { label: 'Quality Audit', path: '/validation', icon: CheckCircle2 },
    ]
  },
  {
    title: 'Recommendation Engines',
    items: [
      { label: 'Content-Based (TF-IDF)', path: '/recommendations/content-based', icon: Sparkles },
      { label: 'Item-Item Collaborative', path: '/recommendations/item-item', icon: GitCompare },
      { label: 'Hybrid Score Fusion', path: '/recommendations/hybrid', icon: Layers, badge: 'Smart', badgeColor: 'bg-blue-50 text-blue-600 border border-blue-200' },
      { label: 'Strategy Explorer', path: '/recommendations/explorer', icon: Search },
    ]
  },
  {
    title: 'Analytics & Benchmarking',
    items: [
      { label: 'Benchmark Arena', path: '/benchmarking', icon: BarChart3, badge: 'Arena', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      { label: 'Consumer Behaviour', path: '/analytics/behaviour', icon: LineChart },
      { label: 'Price Elasticity', path: '/analytics/price', icon: DollarSign },
      { label: 'Demand Momentum', path: '/analytics/demand', icon: TrendingUp },
      { label: 'Strategic Directives', path: '/insights', icon: Lightbulb },
    ]
  },
  {
    title: 'Governance & Settings',
    items: [
      { label: 'Algorithm Tuning', path: '/algorithm-config', icon: Cpu },
      { label: 'Experiment Vault', path: '/experiments', icon: History },
      { label: 'Reports & Exports', path: '/reports', icon: FileSpreadsheet },
      { label: 'Platform Settings', path: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 z-40 transition-all duration-300 ease-in-out border border-slate-200/80 bg-white/90 backdrop-blur-3xl rounded-[28px] shadow-2xl shadow-slate-300/40 flex flex-col overflow-hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header (Bespoke Studio Identity) */}
      <div className="pt-5 pb-3.5 px-4 flex items-center justify-between border-b border-slate-100/90 bg-gradient-to-b from-white via-white to-slate-50/50">
        {!collapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Iridescent Obsidian Studio Insignia */}
            <div className="relative group flex-shrink-0 cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-[1px] shadow-md shadow-indigo-950/25 ring-1 ring-white/20 transition-transform group-hover:scale-105 flex items-center justify-center">
                <div className="w-full h-full rounded-[15px] bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#logo-grad-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="url(#logo-grad-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="1.5" fill="#38BDF8" className="animate-pulse" />
                    <defs>
                      <linearGradient id="logo-grad-1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60A5FA" />
                        <stop offset="1" stopColor="#818CF8" />
                      </linearGradient>
                      <linearGradient id="logo-grad-2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              {/* Status beacon placed at bottom-right of icon so it never clips top container */}
              <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 translate-x-0.5 translate-y-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            {/* Typography */}
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 font-sans leading-none">
                  Reco<span className="text-blue-600">Lab</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider uppercase bg-slate-900 text-white shadow-2xs leading-none">
                  STUDIO
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium tracking-tight mt-1 flex items-center space-x-1 leading-none">
                <span>AI Recommendation Lab</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="relative group mx-auto cursor-pointer" onClick={onToggle} title="Expand Studio Sidebar">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-[1px] shadow-md shadow-indigo-950/25 ring-1 ring-white/20 transition-transform group-hover:scale-105 flex items-center justify-center">
              <div className="w-full h-full rounded-[15px] bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center border border-white/10">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="1.5" fill="#38BDF8" />
                </svg>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 translate-x-0.5 translate-y-0.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center hidden md:flex flex-shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Studio Workspace Status Capsule */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">Studio Core</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
            v2.4 Live
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && (
              <div className="flex items-center justify-between px-3 mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  {section.title}
                </span>
                <div className="flex-1 h-px bg-slate-100 ml-2" />
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-xs rounded-xl transition-all duration-150 group ${
                          isActive
                            ? 'bg-slate-900 text-white font-semibold shadow-md shadow-slate-900/15 border border-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              collapsed ? 'mx-auto' : 'mr-3'
                            } ${
                              isActive
                                ? 'text-blue-400'
                                : 'text-slate-400 group-hover:text-slate-800'
                            }`}
                          />
                          {!collapsed && (
                            <span className="flex-1 truncate tracking-tight">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span
                              className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-blue-500/25 text-blue-200 border border-blue-400/30'
                                  : item.badgeColor || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Info Dock */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700 text-[11px]">Atlas Cluster</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              ⚡ 12ms
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          </div>
        )}
      </div>
    </aside>
  );
};
