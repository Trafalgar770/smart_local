import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';

interface SafetyBannerProps {
  hazardText?: string;
  onDismiss?: () => void;
  showEmergencyDial?: boolean;
}

export function SafetyBanner({
  hazardText = 'CRITICAL HAZARD DETECTED: Shut off main breakers/engine immediately and step to a safe distance.',
  onDismiss,
  showEmergencyDial = true,
}: SafetyBannerProps) {
  return (
    <div
      role="alert"
      className="bg-gradient-to-r from-red-950/90 via-red-900/90 to-amber-950/90 border-b-2 border-red-500/80 px-4 py-3 shadow-xl backdrop-blur-md sticky top-0 z-50 animate-pulse-subtle"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-600/30 border border-red-500 text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-bounce-soft" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-300 uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-red-900/80 border border-red-700">
                Safety Priority Alert
              </span>
              <span className="text-white font-semibold">{hazardText}</span>
            </div>
            <p className="text-red-200/80 text-xs mt-0.5">
              Do not attempt hazardous DIY repairs on live circuits, gas lines, or highway traffic.
            </p>
          </div>
        </div>

        {showEmergencyDial && (
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/50 transition-all hover:scale-105"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial 112 (National Emergency)
            </a>
            <a
              href="tel:1033"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white font-semibold text-xs border border-amber-500 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              1033 (Highway Helpline)
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1.5 text-red-300 hover:text-white hover:bg-red-800/40 rounded-lg transition"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SafetyBanner;
