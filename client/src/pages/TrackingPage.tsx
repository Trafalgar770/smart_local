import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { ShareTrackingButton } from '../components/ShareTrackingButton';
import {
  ShieldCheck,
  ShieldOff,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Star,
  Check,
  Search,
  Home
} from 'lucide-react';

export function TrackingPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [trackingData, setTrackingData] = useState<any>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Polling / Realtime fetch
  useEffect(() => {
    if (!requestId) {
      setIsNotFound(true);
      setLoading(false);
      return;
    }

    fetchTrackingInfo();
    const timer = setInterval(() => {
      fetchTrackingInfo();
    }, 4000);

    return () => clearInterval(timer);
  }, [requestId]);

  const fetchTrackingInfo = async () => {
    try {
      const [trackRes, reqRes] = await Promise.all([
        fetch(`/api/tracking/${requestId}`).then(r => r.json()).catch(() => ({})),
        fetch(`/api/requests/${requestId}`).then(r => r.json()).catch(() => ({})),
      ]);

      if (trackRes.tracking) {
        setTrackingData(trackRes.tracking);
        setIsNotFound(false);
      }
      if (reqRes.request) {
        setRequestData(reqRes.request);
        setIsNotFound(false);
      }

      if (!trackRes.tracking && !reqRes.request) {
        setIsNotFound(true);
      }
    } catch (err) {
      console.error('Failed to poll tracking:', err);
      if (!trackingData) {
        setIsNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLocation = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/location-consent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackingData((prev: any) => ({
          ...prev,
          locationSharingApproved: false,
          customerLocation: null,
        }));
      }
    } catch (err) {
      console.error('Revocation failed:', err);
    }
  };

  const handleSimulateStep = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/tracking/simulate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.tracking) {
        setTrackingData(data.tracking);
      }
    } catch (err) {
      console.error('Simulate step failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this emergency request?')) return;
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Request has been cancelled. Location sharing has ended.');
        navigate('/history');
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isNotFound && !trackingData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Tracking Link Not Found or Expired</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The service request ID (<span className="font-mono text-slate-300">#{requestId}</span>) could not be located. The job may have already completed, expired, or the link is invalid.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/30 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
            <Link
              to="/providers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Technicians</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !trackingData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Connecting to real-time dispatch stream...</p>
        </div>
      </div>
    );
  }

  const currentStatus = requestData?.status || trackingData?.status || 'ON_THE_WAY';
  const provider = trackingData?.provider || requestData?.provider || {
    business_name: 'Bangalore Quick Bike Doctor',
    rating: 4.9,
    phone_number: '+919876543210',
  };

  const STEPS: { key: string; label: string }[] = [
    { key: 'PENDING', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStepIndex = (st: string) => {
    const idx = STEPS.findIndex(s => s.key === st);
    return idx >= 0 ? idx : 2;
  };
  const currentStepIdx = getStepIndex(currentStatus);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Request History</span>
          </button>

          <div className="flex items-center gap-3">
            <ShareTrackingButton
              requestId={requestId!}
              serviceTitle={requestData?.problem_summary || 'Emergency Service'}
            />
            <span className="text-xs font-mono text-slate-500">
              #{requestId?.slice(0, 14)}
            </span>
          </div>
        </div>

        {/* Status Lifecycle Stepper */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between relative">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-brand-500 text-white'
                        : isCurrent
                        ? 'bg-brand-500 text-white ring-4 ring-brand-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] block mt-1.5 font-semibold ${
                      isCurrent ? 'text-brand-300' : isPast ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Vector & Leaflet Map Canvas */}
        <LiveTrackingMap
          providerLocation={
            trackingData?.providerLocation || { latitude: 12.9716, longitude: 77.5946 }
          }
          customerLocation={trackingData?.customerLocation}
          providerName={provider.business_name}
          etaMinutes={trackingData?.etaMinutes ?? 12}
          distanceKm={trackingData?.distanceKm ?? 2.8}
          isLocationShared={Boolean(trackingData?.locationSharingApproved)}
          onRevokeLocation={handleRevokeLocation}
          onSimulateStep={handleSimulateStep}
          isSimulating={isSimulating}
        />

        {/* Provider Contact Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
              alt={provider.business_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40"
            />
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="font-extrabold text-white text-lg">
                  {provider.business_name}
                </h3>
                <span className="text-amber-400 font-bold text-xs flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {provider.rating || 4.9}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch Status:{' '}
                <strong className="text-brand-300 uppercase">
                  {currentStatus.replace(/_/g, ' ')}
                </strong>
              </p>
              <p className="text-xs text-slate-400">
                Destination Address: {requestData?.customer_address_text || 'Indiranagar, Bangalore'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <a
              href={`tel:${provider.phone_number || '+919876543210'}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Technician</span>
            </a>

            {currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED' && (
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 text-xs font-semibold transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingPage;
