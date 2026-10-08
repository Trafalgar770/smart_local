import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AIAnalysisResult } from '../../types';
import {
  Sparkles,
  Activity,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Clock
} from 'lucide-react';

export const AssistanceHistory: React.FC = () => {
  const [sessions, setSessions] = useState<AIAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getAiHistory()
      .then(res => setSessions(res.sessions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Activity className="w-6 h-6 text-brand-400" />
              <span>AI Problem Assistance History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review your past diagnostic consultations, checklists, and recommended solutions.
            </p>
          </div>

          <Link
            to="/customer/ai"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Diagnosis</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading AI consultation history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No previous consultations recorded</h3>
            <p className="text-xs text-slate-400">Start by describing your first problem to the AI assistant.</p>
            <Link to="/customer/ai" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              Start Diagnosis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(sess => (
              <div
                key={sess.sessionId}
                onClick={() => navigate(`/customer/analysis/${sess.sessionId}`, { state: { analysis: sess } })}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-brand-500/40 cursor-pointer transition space-y-2.5 block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">
                      {sess.detectedService?.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 uppercase font-bold">
                      {sess.confidence} confidence
                    </span>
                  </div>

                  <span className="text-xs text-brand-400 font-semibold flex items-center space-x-1">
                    <span>Re-open Checklist</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {sess.problemSummary}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>{sess.checklistItems?.length || 5} safety checklist points generated</span>
                  <span className="text-emerald-400 font-mono font-medium">₹{sess.estimatedPriceMin} – ₹{sess.estimatedPriceMax} est.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
