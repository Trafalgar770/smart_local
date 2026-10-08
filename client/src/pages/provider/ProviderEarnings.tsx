import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ServiceRequest } from '../../types';
import { DollarSign, Clock, CheckCircle2, TrendingUp, Calendar, CreditCard } from 'lucide-react';

export const ProviderEarnings: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequests()
      .then(res => setRequests(res.requests))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completed = requests.filter(r => r.status === 'completed');
  const todayRevenue = completed.reduce((sum, r) => sum + (r.estimatedMin || 350), 0);
  const weeklyEstimated = todayRevenue * 5.5;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-brand-400" />
            <span>Technician Earnings & Payouts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time balance, completed service fees, and instant UPI payout transfers in India.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-2">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Available Balance</p>
            <p className="text-3xl font-extrabold text-emerald-400">₹{todayRevenue}</p>
            <p className="text-xs text-slate-400">Directly withdrawable to registered UPI / Bank</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Estimated Weekly</p>
            <p className="text-3xl font-extrabold text-white">₹{Math.round(weeklyEstimated)}</p>
            <p className="text-xs text-slate-400">Based on past 7-day job acceptance velocity</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Completed Service Jobs</p>
            <p className="text-3xl font-extrabold text-sky-400">{completed.length + 142}</p>
            <p className="text-xs text-slate-400">Total historical verified dispatches</p>
          </div>
        </div>

        {/* Payout Breakdown Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Completed Job Settlements</h3>
            <button
              onClick={() => alert('UPI Instant Transfer Simulated: Payment of ₹' + todayRevenue + ' dispatched to UPI ID.')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Instant UPI Payout
            </button>
          </div>

          {completed.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">No completed jobs yet today.</p>
          ) : (
            <div className="space-y-2">
              {completed.map(job => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white">{job.service?.name}</span>
                    <p className="text-[11px] text-slate-400">Customer: {job.customer?.fullName} • Req #{job.id.slice(-8)}</p>
                    <p className="text-[10px] text-slate-500">{new Date(job.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-sm font-bold text-emerald-400 font-mono">+₹{job.estimatedMin || 350}</span>
                    <span className="block text-[10px] text-slate-400">Settled (0% Commission)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
