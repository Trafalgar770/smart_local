import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { ServiceCategory } from '../types';

interface DiagnosticPanelProps {
  identifiedIssue: string;
  primaryCategory: string;
  alternativeCategories?: string[];
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
  safetyHazardDetected?: boolean;
  safetyWarningText?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  onProceedToMatching?: () => void;
  proceedLabel?: string;
}

export function DiagnosticPanel({
  identifiedIssue,
  primaryCategory,
  alternativeCategories = [],
  confidenceLevel,
  safetyHazardDetected = false,
  safetyWarningText,
  estimatedMin = 299,
  estimatedMax = 899,
  onProceedToMatching,
  proceedLabel = 'Find Verified Local Providers',
}: DiagnosticPanelProps) {
  const getConfidenceBadge = (level: 'HIGH' | 'MODERATE' | 'LOW') => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            High Confidence
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
            <TrendingUp className="w-3.5 h-3.5" />
            Moderate Confidence
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/40 text-blue-300">
            <HelpCircle className="w-3.5 h-3.5" />
            Preliminary Diagnostic
          </span>
        );
    }
  };

  const formatCategoryName = (cat: string) => {
    return cat
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-700/70 shadow-2xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            AI Diagnostic Assessment
          </span>
          <h2 className="text-2xl font-black text-white mt-0.5">
            {formatCategoryName(primaryCategory)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {getConfidenceBadge(confidenceLevel)}
        </div>
      </div>

      {/* Safety Hazard Alert Override */}
      {safetyHazardDetected && (
        <div className="rounded-xl p-4 bg-red-950/60 border-2 border-red-500/80 text-red-200 flex items-start gap-3.5 shadow-lg shadow-red-950/50">
          <div className="p-2 rounded-lg bg-red-600/30 text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm md:text-base flex items-center gap-2">
              <span>Safety Hazard Override</span>
              <span className="text-xs bg-red-900 px-2 py-0.5 rounded text-red-300 font-bold border border-red-700">
                Action Required
              </span>
            </h3>
            <p className="text-sm mt-1 text-red-200/90 leading-relaxed">
              {safetyWarningText ||
                'Hazard indicators detected (sparks, smoke, gas, or high-speed traffic). Do not attempt manual tampering. Exercise caution and maintain safe perimeter.'}
            </p>
          </div>
        </div>
      )}

      {/* Problem Breakdown Card */}
      <div className="rounded-xl p-5 bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <Info className="w-4 h-4 text-brand-400" />
          <span>Technical Diagnostic Hypothesis</span>
        </div>
        <p className="text-white text-base md:text-lg font-medium leading-relaxed">
          {identifiedIssue}
        </p>
        <p className="text-slate-400 text-xs">
          * AI diagnostics provide probabilistic assessments. Technician will verify actual component state on-site.
        </p>
      </div>

      {/* Alternative Categories if any */}
      {alternativeCategories && alternativeCategories.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Related Secondary Specialties:
          </span>
          <div className="flex flex-wrap gap-2">
            {alternativeCategories.map((alt, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {formatCategoryName(alt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price & Action Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
        <div>
          <span className="text-xs text-slate-400 font-medium block">
            Standard Estimated Service Fee
          </span>
          <span className="text-2xl font-black text-white">
            ₹{estimatedMin} – ₹{estimatedMax}
          </span>
          <span className="text-slate-500 text-xs ml-1.5">(Inspection & Basic Fix)</span>
        </div>

        {onProceedToMatching && (
          <button
            type="button"
            id="proceed-to-providers-btn"
            onClick={onProceedToMatching}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-900/40 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{proceedLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DiagnosticPanel;
