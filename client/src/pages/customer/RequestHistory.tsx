import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceRequest } from '../../types';
import {
  Clock,
  Navigation,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

export const RequestHistory: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRequests()
      .then(res => setRequests(res.requests))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    if (filter === 'active') return ['request_sent', 'accepted', 'on_the_way', 'arrived', 'service_started'].includes(r.status);
    if (filter === 'completed') return r.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Clock className="w-6 h-6 text-brand-400" />
              <span>Service Request History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track live jobs, review past service dispatches, and check provider details.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 glass-panel p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'active' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${filter === 'completed' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading your request bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No service requests found</h3>
            <p className="text-xs text-slate-400">You don't have any requests matching this filter.</p>
            <Link to="/customer/ai" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              Book a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const isActive = ['request_sent', 'accepted', 'on_the_way', 'arrived', 'service_started'].includes(req.status);

              return (
                <div
                  key={req.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                        #{req.id.slice(-8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        req.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : req.status === 'cancelled'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-brand-950 text-brand-400 border border-brand-800 animate-pulse'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">
                      {req.service?.name} • {req.provider?.businessName}
                    </h3>

                    <p className="text-xs text-slate-300 max-w-xl line-clamp-1">
                      {req.problemDescription}
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center space-x-2">
                      <span>{new Date(req.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>₹{req.estimatedMin || 299} base fee</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => navigate(`/tracking/${req.id}`)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                        isActive
                          ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Track Live Provider' : 'View Job Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
};
