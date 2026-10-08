import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceRequest, RequestStatus } from '../../types';
import { LeafletMap } from '../../components/LeafletMap';
import {
  Wrench,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  Send,
  X
} from 'lucide-react';

const STATUS_PROGRESSION: { [key in RequestStatus]?: { next: RequestStatus; label: string } } = {
  request_sent: { next: 'accepted', label: 'Accept Request' },
  accepted: { next: 'on_the_way', label: 'Depart & Go On The Way' },
  on_the_way: { next: 'arrived', label: 'Mark as Arrived on Site' },
  arrived: { next: 'service_started', label: 'Begin Service Work' },
  service_started: { next: 'completed', label: 'Mark Service Completed' },
};

export const ActiveJobs: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<ServiceRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);

  const fetchJobs = () => {
    api.getRequests()
      .then(res => {
        setRequests(res.requests);
        const ongoing = res.requests.filter(r =>
          ['accepted', 'on_the_way', 'arrived', 'service_started'].includes(r.status)
        );
        if (ongoing.length) {
          setActiveJob(ongoing[0]);
        } else {
          setActiveJob(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (reqId: string, nextStatus: RequestStatus) => {
    try {
      setUpdating(true);
      await api.updateRequestStatus(reqId, nextStatus);
      fetchJobs();
    } catch (err: any) {
      alert('Failed to update job stage: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const ongoingJobs = requests.filter(r =>
    ['accepted', 'on_the_way', 'arrived', 'service_started'].includes(r.status)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-brand-400" />
            <span>Active Dispatched Jobs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stage tracking, GPS navigation, and customer communications during service execution.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : ongoingJobs.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">No active jobs in progress</h3>
            <p className="text-xs text-slate-400">Accept incoming customer requests from your dashboard.</p>
            <Link to="/provider/requests" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              View Incoming Requests
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Selection Tabs */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-slate-400">Ongoing Dispatches ({ongoingJobs.length})</p>
              {ongoingJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setActiveJob(job)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    activeJob?.id === job.id
                      ? 'bg-brand-950/40 border-brand-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{job.customer?.fullName || 'Customer'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold uppercase">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">{job.problemDescription}</p>
                  <p className="text-[11px] text-slate-500 mt-2 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{job.customerAddress || 'Connaught Place, New Delhi'}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Active Job Controls & Live Route Map */}
            {activeJob && (
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      JOB #{activeJob.id.slice(-8)}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      {activeJob.service?.name} • {activeJob.customer?.fullName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      📍 Destination: <strong>{activeJob.customerAddress || 'Connaught Place, New Delhi'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsDialerOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call Customer</span>
                    </button>
                  </div>
                </div>

                {/* Status Stage Stepper Action */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Current Job Stage:</span>
                    <span className="font-bold text-brand-400 text-sm font-mono uppercase">
                      {activeJob.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {STATUS_PROGRESSION[activeJob.status] && (
                    <button
                      onClick={() => handleAdvanceStatus(activeJob.id, STATUS_PROGRESSION[activeJob.status]!.next)}
                      disabled={updating}
                      className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{STATUS_PROGRESSION[activeJob.status]!.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {activeJob.status === 'service_started' && (
                    <p className="text-[11px] text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40 text-center">
                      ⚠️ Note: Marking completed will immediately and automatically stop customer location sharing.
                    </p>
                  )}
                </div>

                {/* Live Navigation Map View */}
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center space-x-1">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>Navigation & GPS Route:</span>
                  </p>
                  <LeafletMap
                    customerCoords={{
                      lat: activeJob.customerLatitude || 28.6315,
                      lng: activeJob.customerLongitude || 77.2167,
                      label: `${activeJob.customer?.fullName || 'Customer'} (Destination)`,
                    }}
                    providerCoords={{
                      lat: 28.6410,
                      lng: 77.2010,
                      label: 'Your Vehicle',
                    }}
                    status={activeJob.status}
                    isSimulated={true}
                    className="h-80 w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Telephony Dial Modal */}
        {isDialerOpen && activeJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-xs w-full glass-panel p-6 rounded-3xl border border-slate-700 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{activeJob.customer?.fullName}</h4>
                <p className="text-xs text-slate-400 mt-1">Direct Call Prototype</p>
                <p className="font-mono text-sm text-emerald-400 font-bold mt-2">
                  {activeJob.customer?.phone || '+91 98112 34567'}
                </p>
              </div>
              <button
                onClick={() => setIsDialerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
