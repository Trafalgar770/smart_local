import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ServiceRequest, ProviderProfile } from '../../types';
import {
  Activity,
  Navigation,
  Wrench,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user, providerProfile } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(providerProfile);
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>(
    providerProfile?.availabilityStatus || 'available'
  );
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    api.getRequests()
      .then(res => setRequests(res.requests))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    try {
      setStatus(newStatus);
      const res = await api.updateProviderStatus(newStatus);
      setProfile(res.provider);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      await api.updateRequestStatus(reqId, 'accepted');
      fetchDashboardData();
      navigate('/provider/jobs');
    } catch (err: any) {
      alert('Failed to accept: ' + err.message);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await api.updateRequestStatus(reqId, 'cancelled');
      fetchDashboardData();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const incomingRequests = requests.filter(r => r.status === 'request_sent');
  const activeJobs = requests.filter(r => ['accepted', 'on_the_way', 'arrived', 'service_started'].includes(r.status));
  const completedJobs = requests.filter(r => r.status === 'completed');

  const todayEarnings = completedJobs.reduce((sum, r) => sum + (r.estimatedMin || 350), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome & Live Status Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-brand-400 font-bold tracking-wider">
              PROVIDER PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {profile?.businessName || user?.fullName || 'Vikram Auto & Roadside Rescue'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Dispatched technician control room & incoming roadside requests.
            </p>
          </div>

          {/* Availability Status Switch */}
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => handleStatusChange('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                status === 'available'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span>Available</span>
            </button>

            <button
              onClick={() => handleStatusChange('busy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                status === 'busy'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              <span>Busy</span>
            </button>

            <button
              onClick={() => handleStatusChange('offline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                status === 'offline'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Offline</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Incoming Requests</p>
            <p className="text-2xl font-extrabold text-brand-400">{incomingRequests.length}</p>
            <p className="text-[11px] text-slate-500">Needs review & dispatch</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Jobs</p>
            <p className="text-2xl font-extrabold text-sky-400">{activeJobs.length}</p>
            <p className="text-[11px] text-slate-500">On the way / on-site</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-extrabold text-emerald-400">₹{todayEarnings}</p>
            <p className="text-[11px] text-slate-500">{completedJobs.length} completed jobs</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Rating</p>
            <p className="text-2xl font-extrabold text-amber-400 flex items-center space-x-1">
              <span>{profile?.averageRating?.toFixed(2) || '4.88'}</span>
              <Star className="w-5 h-5 fill-current" />
            </p>
            <p className="text-[11px] text-slate-500">From verified bookings</p>
          </div>
        </div>

        {/* Incoming Dispatches Card List */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-brand-400" />
              <span>Incoming Customer Service Requests ({incomingRequests.length})</span>
            </h3>
            <Link to="/provider/requests" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              View All Requests →
            </Link>
          </div>

          {incomingRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              No new incoming requests at this moment. You are visible to nearby customers in {profile?.serviceArea || 'Delhi NCR'}.
            </p>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold text-brand-400 uppercase">
                        REQ #{req.id.slice(-8)}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {req.service?.name} • {req.customer?.fullName || 'Customer'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{req.problemDescription}"
                    </p>

                    {req.aiSummary && (
                      <p className="text-[11px] text-brand-300 bg-brand-950/40 p-2 rounded-lg border border-brand-800/40">
                        🤖 <strong>AI Diagnosis:</strong> {req.aiSummary}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500">
                      📍 {req.customerAddress || 'Connaught Place, New Delhi'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Navigate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs Quick Link */}
        {activeJobs.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">You have {activeJobs.length} active job(s) in progress</h4>
                <p className="text-xs text-slate-400">Advance job stages, communicate with customer, and view live route.</p>
              </div>
            </div>
            <Link
              to="/provider/jobs"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <span>Manage Active Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
