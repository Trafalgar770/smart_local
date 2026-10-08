import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ServiceRequest, AIAnalysisResult, ServiceDefinition } from '../../types';
import {
  Sparkles,
  Compass,
  Clock,
  Navigation,
  ShieldCheck,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Wrench,
  Activity
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [recentAiSessions, setRecentAiSessions] = useState<AIAnalysisResult[]>([]);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRequests(),
      api.getAiHistory(),
      api.getServices(),
    ])
      .then(([reqRes, aiRes, srvRes]) => {
        // Find ongoing request (case-insensitive for PENDING / request_sent)
        const active = reqRes.requests.find(r =>
          ['request_sent', 'accepted', 'on_the_way', 'arrived', 'service_started', 'pending', 'in_progress'].includes(
            (r.status || '').toLowerCase()
          )
        );
        setActiveRequest(active || null);
        setRecentAiSessions(aiRes.sessions.slice(-3));
        setServices(srvRes.services.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-brand-400 font-bold tracking-wider">
              CUSTOMER DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Namaste, {user?.fullName || 'Rahul'} 🙏
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Your AI-powered local services and roadside assistance command center.
            </p>
          </div>

          <Link
            to="/customer/ai"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>New AI Problem Triage</span>
          </Link>
        </div>

        {/* Active Ongoing Job Banner (if any) */}
        {activeRequest && (
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/40 bg-gradient-to-r from-slate-900 via-brand-950/20 to-slate-900 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    ACTIVE JOB IN PROGRESS: {activeRequest.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeRequest.service?.name} • {activeRequest.provider?.businessName}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl line-clamp-1">
                  {activeRequest.problemDescription}
                </p>
              </div>

              <button
                onClick={() => navigate(`/customer/tracking/${activeRequest.id}`)}
                className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shrink-0"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Live Tracking & ETA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/customer/ai"
            className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 block"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">AI Problem Diagnostician</h3>
            <p className="text-xs text-slate-400">Triage symptoms, get safety advice, and run optional Before You Call checks.</p>
          </Link>

          <Link
            to="/customer/providers"
            className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 block"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Nearby Service Providers</h3>
            <p className="text-xs text-slate-400">Browse verified mechanics, electricians, and plumbers ranked by distance.</p>
          </Link>

          <Link
            to="/customer/history"
            className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 block"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Bookings & Request History</h3>
            <p className="text-xs text-slate-400">Check current statuses, reviews, past service tickets, and invoices.</p>
          </Link>
        </div>

        {/* Popular Categories Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Popular Technical Services (India)</h3>
            <Link to="/services" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              View All 17 Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {services.map(s => (
              <Link
                key={s.id}
                to={`/customer/ai?category=${s.slug}`}
                className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-brand-500/30 transition text-left space-y-1 block"
              >
                <h4 className="font-bold text-white text-xs">{s.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{s.description}</p>
                <p className="text-[10px] text-emerald-400 font-mono">₹{s.typicalPriceMin} – ₹{s.typicalPriceMax}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent AI Sessions History */}
        {recentAiSessions.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-400" />
                <span>Recent AI Problem Consultations</span>
              </h3>
              <Link to="/customer/assistance" className="text-xs text-slate-400 hover:text-white">
                View All History →
              </Link>
            </div>

            <div className="space-y-2">
              {recentAiSessions.map(sess => (
                <div
                  key={sess.sessionId}
                  onClick={() => navigate(`/customer/analysis/${sess.sessionId}`, { state: { analysis: sess } })}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between cursor-pointer transition text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">{sess.detectedService?.name}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{sess.problemSummary}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
