import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AiIntakeHub } from '../components/AiIntakeHub';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Zap,
  MapPin,
  Star
} from 'lucide-react';

export const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async (
    customPrompt?: string,
    categoryHint?: string,
    inputType: 'TEXT' | 'VOICE' | 'VISION' = 'TEXT',
    imageBase64?: string
  ) => {
    const textToSubmit = customPrompt;
    if (!textToSubmit?.trim() && !imageBase64) return;

    try {
      setLoading(true);
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: textToSubmit || 'Visual diagnostic inspection submitted',
          inputType,
          imageBufferBase64: imageBase64,
          categoryHint,
        }),
      });
      const data = await res.json();
      navigate('/analyze', {
        state: {
          problemDescription: textToSubmit || 'Visual diagnostic inspection submitted',
          rawInput: textToSubmit || 'Visual diagnostic inspection submitted',
          identified_issue: data.identified_issue,
          primary_category: data.primary_category,
          alternative_categories: data.alternative_categories,
          confidence_level: data.confidence_level,
          safety_hazard_detected: data.safety_hazard_detected,
          safety_warning_text: data.safety_warning_text,
          checklist_schema: data.checklist_schema,
          analysis: data.analysis,
        },
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      // Fallback navigate to /analyze so workflow continues uninterrupted
      navigate('/analyze', {
        state: {
          problemDescription: textToSubmit,
          rawInput: textToSubmit,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-sky-500/10 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AiIntakeHub
            onAnalyze={(description, inputType, imageBase64) =>
              handleAnalyze(description, undefined, inputType, imageBase64)
            }
            isLoading={loading}
          />
        </div>
      </section>

      {/* The Two Signature Features Pillars */}
      <section className="py-14 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Two Signature Innovations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Transforming "I don't know what's wrong" into safe clarity, verified local technicians, and private live location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: AI Before The Service */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-brand-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-brand-400 tracking-wider">
                FEATURE PILLAR 1
              </span>
              <h3 className="text-xl font-bold text-white">
                1. AI BEFORE THE SERVICE
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The AI helps you understand what could be failing, asks clarifying questions, and generates an <strong>optional "Before You Call" safety checklist</strong>. Check only what you can safely check, skip the rest—you are never blocked.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Root-cause hypothesis with confidence rating</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Independent 4-state checklist (Unanswered ≠ No)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Immediate hazard detection & electrical/highway warnings</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2: Live Location During Service */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-sky-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-sky-400 tracking-wider">
                FEATURE PILLAR 2
              </span>
              <h3 className="text-xl font-bold text-white">
                2. LIVE LOCATION DURING THE SERVICE
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Location is never shared automatically. After your <strong>explicit permission approval</strong>, coordinates are shared temporarily only with your assigned provider during the active job.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Explicit customer consent flow & manual address fallback</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Interactive tracking map with clearly labeled simulation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Automatic location termination upon job completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Step-by-Step Interactive Guide */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-10">
          The Production Lifecycle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-brand-400">STEP 01</span>
            <h4 className="font-bold text-white text-sm">Describe or Scan</h4>
            <p className="text-xs text-slate-400">Speak, type, or upload photo of the broken part or vehicle issue.</p>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-brand-400">STEP 02</span>
            <h4 className="font-bold text-white text-sm">Optional Safety Checklist</h4>
            <p className="text-xs text-slate-400">Verify what you can. Leave the rest unanswered. Reassess anytime.</p>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-sky-400">STEP 03</span>
            <h4 className="font-bold text-white text-sm">Select Verified Provider</h4>
            <p className="text-xs text-slate-400">Compare nearby mechanics, plumbers, and electricians by ETA & rating.</p>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-sky-400">STEP 04</span>
            <h4 className="font-bold text-white text-sm">Live Track & Complete</h4>
            <p className="text-xs text-slate-400">Grant temporary GPS tracking. Service completes, sharing ends automatically.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
