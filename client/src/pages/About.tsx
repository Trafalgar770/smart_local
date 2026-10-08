import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Navigation, Shield, Database, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400">
            <span>Product Architecture & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Transforming Local Services for India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SMART LOCAL SERVICE is built on a simple insight: When a breakdown occurs or a critical home appliance fails, customers rarely know the technical root cause or which certified professional to call.
          </p>
        </div>

        {/* The Problem & Solution */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">The Core Paradigm Shift</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-2">
              <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Conventional Platforms:</span>
              <p className="text-slate-300 leading-relaxed">
                Customer is forced to guess a category from an endless directory. No safety guidance. Unsolicited spam calls. Uncontrolled location leakage.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">SMART LOCAL SERVICE:</span>
              <p className="text-slate-300 leading-relaxed">
                Customer describes symptoms naturally. AI performs clinical technical triage, presents an optional Before You Call checklist, matches verified providers, and streams location <em>only</em> while the service is active.
              </p>
            </div>
          </div>
        </div>

        {/* Two Signature Features Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">1. AI Before The Service</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides non-destructive safe checks. The customer can answer 1 item, all items, or skip the checklist entirely. Every checklist item possesses an independent 4-state lifecycle (<code>UNANSWERED</code>, <code>YES</code>, <code>NO</code>, <code>UNKNOWN</code>). An unanswered check is never assumed to be negative.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">2. Live Location During The Service</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Location is shared <strong>only with explicit customer permission</strong> for the specific active service request. The provider cannot query location outside the active window. Once marked completed or cancelled, location sharing automatically terminates instantly.
            </p>
          </div>
        </div>

        {/* System Tech Stack Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Hackathon & Production Architecture</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Frontend</span>
              <p className="font-bold text-white mt-1">React 19 + Vite</p>
              <p className="text-[10px] text-slate-400">Tailwind CSS + Leaflet</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Backend API</span>
              <p className="font-bold text-white mt-1">Express.js (Node 20)</p>
              <p className="text-[10px] text-slate-400">TypeScript + Zod Schema</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Database</span>
              <p className="font-bold text-white mt-1">Supabase PostgreSQL</p>
              <p className="text-[10px] text-slate-400">RLS + UUID Relational</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">AI Engine</span>
              <p className="font-bold text-white mt-1">Gemini 3.8 Flash</p>
              <p className="text-[10px] text-slate-400">+ Local Fallback Rule-Engine</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition"
          >
            <span>Try AI Problem Diagnosis Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
