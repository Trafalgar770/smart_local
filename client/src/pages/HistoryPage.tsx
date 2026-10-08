import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Navigation,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

export function HistoryPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'ai'>('requests');

  const [aiSessions, setAiSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [reqRes, aiRes] = await Promise.all([
        fetch('/api/requests').then(r => r.json()).catch(() => ({ requests: [] })),
        fetch('/api/ai/history').then(r => r.json()).catch(() => ({ sessions: [] })),
      ]);
      if (reqRes.requests) {
        setRequests(reqRes.requests);
      }
      if (aiRes.sessions) {
        setAiSessions(aiRes.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch request history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Assistance & Diagnostics History
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            View your active dispatches, past technical repair logs, and probabilistic AI assessments.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'requests'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Dispatches ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ai'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Problem Diagnostics ({aiSessions.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading service records...
          </div>
        ) : activeTab === 'ai' ? (
          aiSessions.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-slate-300 font-medium">No previous AI diagnostics found.</p>
              <p className="text-slate-500 text-xs">
                Run an intake check to diagnose a vehicle or equipment issue.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition"
              >
                <span>Start New AI Intake</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {aiSessions.map((sess, idx) => (
                <div
                  key={sess.sessionId || idx}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {sess.detectedService?.name || 'DIAGNOSTIC'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide bg-slate-800 text-slate-300">
                        {sess.confidence || 'MODERATE'} CONFIDENCE
                      </span>
                    </div>

                    <h4 className="text-white font-bold text-base">
                      {sess.problemSummary || sess.rawInput || 'AI Equipment Assessment'}
                    </h4>

                    <p className="text-xs text-slate-400">
                      Estimated Cost: ₹{sess.estimatedPriceMin || 299} – ₹{sess.estimatedPriceMax || 799}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => navigate('/analyze', {
                        state: {
                          problemDescription: sess.problemSummary,
                          identified_issue: sess.problemSummary,
                          primary_category: sess.detectedService?.slug?.toUpperCase()?.replace(/-/g, '_'),
                          confidence_level: sess.confidence?.toUpperCase(),
                          safety_hazard_detected: sess.safetyLevel === 'danger',
                          safety_warning_text: sess.safetyWarning,
                          checklist_schema: (sess.checklistItems || []).map((c: any) => ({
                            id: c.id,
                            label: c.itemText,
                            description: c.itemText,
                          })),
                        }
                      })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Checklist</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : requests.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
            <p className="text-slate-300 font-medium">No service dispatches recorded yet.</p>
            <p className="text-slate-500 text-xs">
              When you experience a breakdown or technical problem, use the AI Intake on the homepage.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition"
            >
              <span>Start New AI Intake</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const isFinished = req.status === 'COMPLETED' || req.status === 'CANCELLED';
              return (
                <div
                  key={req.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-brand-300 border border-slate-700">
                        {req.category?.replace(/_/g, ' ') || 'SERVICE'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : req.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <h4 className="text-white font-bold text-base">
                      {req.problem_summary || req.problemDescription}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Provider: <strong className="text-slate-200">{req.provider?.business_name || 'Quick Response Tech'}</strong></span>
                      <span>•</span>
                      <span>{new Date(req.created_at || req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/tracking/${req.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-brand-400" />
                      <span>{isFinished ? 'View Details' : 'Live Tracking'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
