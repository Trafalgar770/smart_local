import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { LocationPermissionModal } from '../components/LocationPermissionModal';
import {
  ShieldCheck,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

export function RequestPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const queryState = (location.state as any) || {};
  const [provider, setProvider] = useState<any>(queryState.provider || null);
  const [category, setCategory] = useState<string>(queryState.category || 'BIKE_MECHANIC');
  const [problemSummary, setProblemSummary] = useState<string>(
    queryState.problemSummary || "Vehicle won't start on road, starter motor clicking"
  );
  const [customerAddress, setCustomerAddress] = useState<string>(
    '12th Main Rd, HAL 2nd Stage, Indiranagar, Bangalore, 560038'
  );

  // Explicit location permission state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationApproved, setLocationApproved] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!provider && providerId) {
      fetch(`/api/providers/${providerId}`)
        .then(r => r.json())
        .then(data => {
          if (data.provider) setProvider(data.provider);
        })
        .catch(err => console.error('Provider fetch failed:', err));
    }
  }, [providerId]);

  const handleOpenPermissionModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerAddress.trim()) {
      alert('Please enter your pickup / breakdown address.');
      return;
    }
    // Launch Explicit Consent Modal
    setIsLocationModalOpen(true);
  };

  const handleApproveLocation = (coords?: { latitude: number; longitude: number }) => {
    setLocationApproved(true);
    if (coords) {
      setCoordinates(coords);
    }
    setIsLocationModalOpen(false);
    // Proceed to create request
    submitRequest(true, coords);
  };

  const handleDeclineLocation = () => {
    setLocationApproved(false);
    setCoordinates(null);
    setIsLocationModalOpen(false);
    // Proceed to create request without GPS broadcast
    submitRequest(false, undefined);
  };

  const submitRequest = async (approvedLocation: boolean, coords?: { latitude: number; longitude: number }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        providerId: providerId || provider?.id || 'b0000001-0001-0001-0001-000000000001',
        category,
        problemSummary,
        estimatedCostMin: provider?.min_price || 299,
        estimatedCostMax: provider?.max_price || 899,
        customerAddressText: customerAddress,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };

      const res = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.request) {
        // If location approved, update consent endpoint
        if (approvedLocation && coords) {
          await fetch(`/api/requests/${data.request.id}/location-consent`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              approved: true,
              latitude: coords.latitude,
              longitude: coords.longitude,
              address: customerAddress,
            }),
          });
        }

        // Navigate directly to live tracking
        navigate(`/tracking/${data.request.id}`);
      } else {
        alert(data.error || 'Failed to submit service request');
      }
    } catch (err: any) {
      console.error('Request creation failed:', err);
      alert('Error creating request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerName = provider?.business_name || 'Assigned Local Specialist';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Explicit Location Permission Consent Modal */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        providerName={providerName}
        onApprove={handleApproveLocation}
        onDecline={handleDeclineLocation}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Navigation */}
        <button
          type="button"
          onClick={() => navigate('/providers')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matched Providers</span>
        </button>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-400">
            Step 3 of 3 • Final Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Confirm Service Dispatch
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Review service parameters and consent protocol before dispatching the technician.
          </p>
        </div>

        {/* Selected Provider Snapshot */}
        {provider && (
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  provider.avatar_url ||
                  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
                }
                alt={provider.business_name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {provider.business_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rating: <span className="text-amber-400 font-bold">★ {provider.rating}</span> • {provider.completed_jobs}+ completed jobs
                </p>
                <span className="text-xs text-brand-400 font-semibold">
                  Estimated Rate: ₹{provider.min_price} – ₹{provider.max_price}
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">Est. Response</span>
              <span className="text-sm font-bold text-white">~12 - 15 mins</span>
            </div>
          </div>
        )}

        {/* Form Details */}
        <form onSubmit={handleOpenPermissionModal} className="space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Problem Description (Sent to Technician)
              </label>
              <textarea
                rows={3}
                value={problemSummary}
                onChange={e => setProblemSummary(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Pickup / Breakdown Location Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Street, Landmark, City (e.g. Near Indiranagar Metro)"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Technicians use landmarks for precise road-side or apartment navigation.
              </p>
            </div>
          </div>

          {/* Explicit Privacy Callout Banner */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Lock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">
                Explicit Location Permission Notice
              </strong>
              <span>
                Clicking &ldquo;Request Dispatch&rdquo; will open the mandatory Location Permission Consent Modal. Exact coordinates are never polled or broadcasted without your explicit opt-in.
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            id="request-dispatch-btn"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-base shadow-xl shadow-brand-900/40 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Initiating Service Dispatch...</span>
            ) : (
              <>
                <span>Review Location Consent & Confirm Dispatch</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestPage;
