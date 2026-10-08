import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceRequest } from '../../types';
import {
  Navigation,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.getRequestById(id)
      .then(res => setRequest(res.request))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (status: any) => {
    if (!id) return;
    try {
      await api.updateRequestStatus(id, status);
      navigate('/provider/jobs');
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 glass-panel rounded-2xl text-center space-y-3 border border-slate-800">
        <h3 className="font-bold text-white text-base">Request Not Found</h3>
        <Link to="/provider/requests" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Back to Requests
        </Link>
      </div>
    );
  }

  const isLocationShared = request.locationShare?.permissionStatus === 'shared';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-brand-400">
              DISPATCH REQUEST #{request.id.slice(-8)}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              {request.service?.name} Job Overview
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-brand-950 text-brand-400 border border-brand-800">
            {request.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Customer & Issue Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-xs text-slate-400">Customer Name:</p>
              <h3 className="font-bold text-white text-base">{request.customer?.fullName || 'Rahul Sharma'}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Contact Number:</p>
              <p className="font-bold text-emerald-400 text-sm font-mono">{request.customer?.phone || '+91 98112 34567'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Problem Description:</p>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">
              "{request.problemDescription}"
            </p>
          </div>

          {request.aiSummary && (
            <div className="bg-brand-950/40 p-4 rounded-xl border border-brand-800/40 text-xs text-brand-200 space-y-1">
              <span className="font-bold flex items-center space-x-1 text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Technical Diagnostic Hypothesis:</span>
              </span>
              <p>{request.aiSummary}</p>
            </div>
          )}

          {/* Location Permission Status */}
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            isLocationShared
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center space-x-2">
              <MapPin className={`w-4 h-4 ${isLocationShared ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <p className="font-bold">
                  {isLocationShared ? 'Customer Location Live Pin Shared' : 'Location Hidden (No Active Permission)'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isLocationShared
                    ? request.customerAddress || 'Connaught Place, New Delhi'
                    : 'Customer must grant permission in app to reveal coordinates.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {request.status === 'request_sent' && (
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Decline Request
            </button>
            <button
              onClick={() => handleUpdateStatus('accepted')}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept & Advance to Active Jobs</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
