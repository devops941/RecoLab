import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('analyst@recolab.io');
  const [password, setPassword] = useState('Analyst@123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-4 relative overflow-hidden text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Soft atmospheric gradient glow matching microdose.studio */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-[#FFE7E0]/70 via-[#FFD6E0]/50 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-[#E0E7FF]/70 via-[#EDE9FE]/50 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-blue-50/60 via-purple-50/40 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle concentric guidelines background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
        <div className="w-[800px] h-[800px] rounded-full border border-slate-900" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-slate-900" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-slate-900" />
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10 space-y-6 relative z-10">
        {/* Floating Capsule Badge */}
        <div className="flex justify-center">
          <div className="studio-pill-badge inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">RecoLab Studio • Live v2.0</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-600">
              <Sparkles className="w-6 h-6 fill-blue-600/10" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B0F19] tracking-tight">
            recolab<span className="text-blue-600">.studio</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Intelligent Product Recommendation & Strategy Benchmarking
          </p>
        </div>

        {/* Preloaded Credentials Box */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-semibold text-slate-700 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Preloaded Platform Credentials:</span>
          </p>
          <div className="text-[11px] font-mono text-slate-600 space-y-1.5">
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div>
                <span className="text-blue-600 font-bold">Analyst:</span> analyst@recolab.io
              </div>
              <button
                type="button"
                onClick={() => { setEmail('analyst@recolab.io'); setPassword('Analyst@123456'); }}
                className="text-[11px] text-blue-600 font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Auto-Fill
              </button>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div>
                <span className="text-purple-600 font-bold">Admin:</span> admin@recolab.io
              </div>
              <button
                type="button"
                onClick={() => { setEmail('admin@recolab.io'); setPassword('Admin@123456'); }}
                className="text-[11px] text-purple-600 font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full studio-button-blue py-3 rounded-full flex items-center justify-center space-x-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign in to Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
