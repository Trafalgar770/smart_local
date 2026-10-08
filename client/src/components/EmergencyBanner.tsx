import React, { useState } from 'react';
import { AlertTriangle, Phone, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-red-100 text-xs sm:text-sm py-2 px-4 border-b border-red-800/60 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-medium">
            Roadside Breakdown or Life Hazard in India?
          </span>
          <span className="hidden md:inline text-red-300">
            Highway SOS: <strong className="text-white">1073</strong> | National Emergency: <strong className="text-white">112</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="tel:1073"
            className="flex items-center space-x-1 px-2.5 py-1 bg-red-800/80 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1073 (NHAI)</span>
          </a>
          <Link
            to="/safety"
            className="underline text-red-200 hover:text-white text-xs"
          >
            Safety Protocols
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-300 hover:text-white p-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
