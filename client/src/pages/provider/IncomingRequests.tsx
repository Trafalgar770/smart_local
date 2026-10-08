import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceRequest } from '../../types';
import {
  Navigation,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const IncomingRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchRequests = () => {
    api.getRequests()
      .then(res => setRequests(res.requests))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (reqId: string) => {
    try {
      await api.updateRequestStatus(reqId, 'accepted');
      navigate('/provider/jobs');
    } catch (err: any) {
      alert('Failed to accept: ' + err.message);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await api.updateRequestStatus(reqId, 'cancelled');
      fetchRequests();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    }
  };

  const incoming = requests.filter(r => r.status === 'request_sent');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-brand-400" />
            <span>Incoming Customer Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time incoming job alerts with customer symptoms, AI diagnostic summaries, and permission-gated locations.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : incoming.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-400">There are no pending incoming service requests right now.</p>
            <Link to="/provider" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {incoming.map(req => {
              const isLocationShared = req.locationShare?.permissionStatus === 'shared';

              return (
                <div
                  key={req.id}
                  className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-brand-400">
                        REQUEST #{req.id.slice(-8)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-white text-sm">
                        {req.service?.name} • {req.customer?.fullName || 'Customer'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Received: {new Date(req.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Problem & AI Notes */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-400">Customer Description:</p>
                      <p className="text-sm text-slate-200 mt-0.5 leading-relaxed">
                        "{req.problemDescription}"
                      </p>
                    </div>

                    {req.aiSummary && (
                      <div className="bg-brand-950/40 border border-brand-800/40 p-3 rounded-xl text-xs text-brand-200 space-y-1">
                        <span className="font-bold flex items-center space-x-1 text-brand-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Triage Summary:</span>
                        </span>
                        <p>{req.aiSummary}</p>
                      </div>
                    )}
                  </div>

                  {/* Location Privacy State */}
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    isLocationShared
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {isLocationShared ? (
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">
                          {isLocationShared
                            ? `📍 Live Location: ${req.customerAddress || 'Connaught Place, New Delhi'}`
                            : 'Location Protected: Customer has not approved live location sharing yet'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 font-bold">
                      {req.locationShare?.permissionStatus || 'not_shared'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                    >
                      Decline Request
                    </button>

                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Start Navigation</span>
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
