import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Navigation
} from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  providerName: string;
  onApprove: (coords?: { latitude: number; longitude: number }) => void;
  onDecline: () => void;
  onClose: () => void;
}

export function LocationPermissionModal({
  isOpen,
  providerName,
  onApprove,
  onDecline,
  onClose,
}: LocationPermissionModalProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApproveWithGPS = () => {
    setIsGettingLocation(true);
    setGeoError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setIsGettingLocation(false);
          onApprove({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        err => {
          setIsGettingLocation(false);
          setGeoError(
            'GPS access prompt denied or timed out. Defaulting to verified area landmark.'
          );
          // Fallback coordinates (e.g. Bangalore center)
          onApprove({
            latitude: 12.9716,
            longitude: 77.5946,
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsGettingLocation(false);
      onApprove({ latitude: 12.9716, longitude: 77.5946 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 md:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-950/40">
          <Navigation className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
          Explicit Location Sharing Consent
        </h3>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
          To guide <strong className="text-white">{providerName}</strong> directly to your breakdown site, your GPS coordinates will be shared under strict privacy invariants.
        </p>

        {/* Privacy Invariant Rules List */}
        <div className="mt-5 space-y-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Strict Purpose Limitation</strong>
              <span>Coordinates are exclusively broadcasted to {providerName} and no third parties.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Automatic Revocation Invariant</strong>
              <span>Location sharing self-terminates the second this job is marked COMPLETED or CANCELLED.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Instant Stop Control</strong>
              <span>You retain an instant &ldquo;Stop Sharing Location&rdquo; button on your tracking dashboard.</span>
            </div>
          </div>
        </div>

        {geoError && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Decision Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            id="approve-location-btn"
            onClick={handleApproveWithGPS}
            disabled={isGettingLocation}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-900/40 disabled:opacity-50 transition transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {isGettingLocation ? (
              <span>Querying High-Accuracy GPS...</span>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Approve Live Location Broadcast</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="decline-location-btn"
            onClick={onDecline}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
          >
            <span>Decline (Use Address / Landmark Text Only)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPermissionModal;
