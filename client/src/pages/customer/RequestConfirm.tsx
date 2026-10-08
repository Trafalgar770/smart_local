import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ProviderProfile, ServiceDefinition } from '../../types';
import {
  Shield,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowRight,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';

export const RequestConfirm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // providerId
  const location = useLocation();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<ProviderProfile | null>((location.state as any)?.provider || null);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState<string>('Emergency roadside technical assistance needed at location.');
  const [aiSummary, setAiSummary] = useState<string>('Customer problem reviewed with AI diagnosis.');

  // Explicit Location Sharing Consent State (MANDATORY REQUIREMENT)
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [manualAddress, setManualAddress] = useState<string>('Near Rajiv Chowk Metro Gate 3, Connaught Place, New Delhi');
  const [useGpsCoords, setUseGpsCoords] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    api.getServices().then(res => {
      setServices(res.services);
      if (provider?.serviceIds?.length) {
        setSelectedServiceId(provider.serviceIds[0]);
      } else if (res.services.length) {
        setSelectedServiceId(res.services[0].id);
      }
    });

    if (!provider && id) {
      api.getProviderById(id).then(res => {
        setProvider(res.provider);
        if (res.provider.serviceIds.length) {
          setSelectedServiceId(res.provider.serviceIds[0]);
        }
      });
    }
  }, [id]);

  const handleConfirmRequest = async () => {
    if (!provider || !selectedServiceId) return;

    try {
      setSubmitting(true);

      // Delhi sample coordinates (customer Rahul)
      const lat = useGpsCoords ? 28.6315 : 28.6315;
      const lng = useGpsCoords ? 77.2167 : 77.2167;

      // 1. Create the Service Request
      const res = await api.createRequest({
        serviceId: selectedServiceId,
        providerId: provider.id,
        problemDescription,
        aiSummary,
        estimatedMin: provider.basePrice,
        estimatedMax: provider.basePrice + 500,
        customerLatitude: lat,
        customerLongitude: lng,
        customerAddress: manualAddress,
      });

      const newRequestId = res.request.id;

      // 2. If customer granted explicit location permission, activate it!
      if (consentGranted) {
        await api.updateLocationPermission(newRequestId, 'shared', {
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          address: manualAddress,
        });
      }

      // Navigate to canonical live tracking screen
      navigate(`/tracking/${newRequestId}`);
    } catch (err: any) {
      console.error('Request confirmation error:', err);
      alert('Failed to submit request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!provider) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-white">Confirm Service Request & Location</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review service details and configure explicit location permissions before dispatching provider.
          </p>
        </div>

        {/* Provider Overview Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <img
            src={provider.avatarUrl}
            alt={provider.businessName}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
          />
          <div className="flex-1 space-y-0.5">
            <h3 className="font-bold text-white text-base">{provider.businessName}</h3>
            <p className="text-xs text-slate-400">{provider.serviceArea}</p>
            <div className="flex items-center space-x-2 text-xs pt-1">
              <span className="text-emerald-400 font-bold">₹{provider.basePrice} base</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-400 font-medium">~{provider.responseTimeMinutes} min response</span>
            </div>
          </div>
        </div>

        {/* Problem Description Box */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Problem Description</h4>
          <textarea
            rows={2}
            value={problemDescription}
            onChange={e => setProblemDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* ============================================================== */}
        {/* EXPLICIT LOCATION PERMISSION FLOW (MANDATORY REQUIREMENT)      */}
        {/* ============================================================== */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-5 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 shadow-xl">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center space-x-2">
                <span>Explicit Location Sharing Permission</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Privacy Protected
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your location is <strong>never shared automatically</strong>. It is shared <strong>ONLY</strong> with {provider.businessName} for this single active request, and <strong>AUTOMATICALLY TERMINATES</strong> the moment the job completes or is cancelled.
              </p>
            </div>
          </div>

          {/* Explicit Consent Checkbox Toggle */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={e => setConsentGranted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  I explicitly grant temporary live location access to {provider.businessName}
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Allows the technician to view your arrival pin & navigate directly to you.
                </span>
              </div>
            </label>
          </div>

          {/* Manual Location Fallback Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Manual Landmark / Address Fallback:</span>
              </label>
              <button
                type="button"
                onClick={() => setManualAddress('Pillar No. 245, Pusa Road Circle, New Delhi')}
                className="text-[11px] text-brand-400 hover:underline"
              >
                Use Sample Landmark
              </button>
            </div>
            <input
              type="text"
              value={manualAddress}
              onChange={e => setManualAddress(e.target.value)}
              placeholder="e.g. Near Rajiv Chowk Metro Gate 3, Connaught Place"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-slate-500">
              Useful if real GPS is inaccurate, indoors, or underground metro stations.
            </p>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmRequest}
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Dispatching Service Request...</span>
              </>
            ) : (
              <>
                <span>Confirm Request & Open Live Tracking</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
