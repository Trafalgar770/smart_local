import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck, Wrench, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, switchPersona } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/customer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await login(email);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (persona: 'customer' | 'provider-mechanic' | 'provider-electrician') => {
    try {
      setSubmitting(true);
      await switchPersona(persona);
      if (persona === 'customer') navigate('/customer');
      else navigate('/provider');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to Smart Local Service</h2>
          <p className="text-xs text-slate-400">Access customer diagnostic history or provider service dispatch portal.</p>
        </div>

        {/* 1-Click Fast Demo Logins for Hackathon Evaluators */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 space-y-3 bg-gradient-to-b from-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-brand-400">⚡ Hackathon 1-Click Evaluator Login</span>
            <span className="text-[10px] text-slate-400">Instant Access</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-xs text-left flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">Sign in as Rahul Sharma (Customer)</span>
                  <span className="text-[10px] text-slate-400">Has active bike breakdown & live tracking ticket</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('provider-mechanic')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-xs text-left flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Sign in as Vikram Singh (Mechanic)</span>
                  <span className="text-[10px] text-slate-400">Roadside rescue provider with incoming jobs</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('provider-electrician')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-xs text-left flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold text-white block">Sign in as Rajesh Kumar (Electrician)</span>
                  <span className="text-[10px] text-slate-400">Licensed residential technician in Paharganj</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul.customer@demo.local"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-brand-500/20"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
