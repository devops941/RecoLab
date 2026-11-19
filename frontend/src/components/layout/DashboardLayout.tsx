import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Dreamy Ethereal Studio Ambient Gradients (Inspired by microdose.studio) */}
      <div className="fixed top-0 left-0 w-[600px] h-[500px] bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[650px] h-[550px] bg-gradient-to-bl from-purple-200/40 via-blue-200/30 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-sky-100/40 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Subtle Fine Concentric Geometric Circle Guideline in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] flex items-center justify-center">
        <div className="w-[1100px] h-[1100px] rounded-full border border-slate-900" />
        <div className="absolute w-[800px] h-[800px] rounded-full border border-slate-900" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-slate-900" />
      </div>

      {/* Floating Island Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Workspace Dock with Dynamic Margin for Floating Sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10 ${
          collapsed ? 'pl-28' : 'pl-72'
        } pr-4 sm:pr-6 py-4`}
      >
        <Navbar collapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 mt-4 max-w-7xl w-full mx-auto pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
