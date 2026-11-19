import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Data Analyst');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await register(fullName, email, password, role);
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

      {/* Concentric watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
        <div className="w-[800px] h-[800px] rounded-full border border-slate-900" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-slate-900" />
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10 space-y-6 relative z-10">
        <div className="flex justify-center">
          <div className="studio-pill-badge inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide">New Studio Workspace</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-600">
              <Sparkles className="w-6 h-6 fill-blue-600/10" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B0F19] tracking-tight">
            Create Profile
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Join the RecoLab intelligent recommendation benchmarking platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="Dr. Alex Rivera"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all"
                placeholder="alex@recolab.io"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organizational Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#2563EB] focus:outline-none text-slate-900 cursor-pointer font-medium"
            >
              <option value="Data Analyst">Data Analyst (Standard Access)</option>
              <option value="ML Engineer">Machine Learning Engineer</option>
              <option value="Product Manager">Product & Commerce Strategist</option>
              <option value="Administrator">Platform Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full studio-button-blue py-3 rounded-full flex items-center justify-center space-x-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>{loading ? 'Creating Workspace...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
