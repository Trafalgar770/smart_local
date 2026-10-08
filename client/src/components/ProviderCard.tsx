import React from 'react';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Phone,
  Zap
} from 'lucide-react';

export interface ProviderItem {
  id: string;
  business_name: string;
  categories: string[];
  is_available: boolean;
  is_demo?: boolean;
  rating: number;
  completed_jobs: number;
  min_price: number;
  max_price: number;
  distance_km?: number;
  eta_minutes?: number;
  phone_number?: string;
  avatar_url?: string;
}

interface ProviderCardProps {
  provider: ProviderItem;
  onSelect: (provider: ProviderItem) => void;
  isRecommended?: boolean;
}

export function ProviderCard({
  provider,
  onSelect,
  isRecommended = false,
}: ProviderCardProps) {
  const formatCategory = (cat: string) => {
    return cat
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const distance = provider.distance_km ?? 3.2;
  const eta = provider.eta_minutes ?? 15;

  return (
    <div
      className={`glass-card rounded-2xl p-5 md:p-6 transition-all duration-300 relative flex flex-col justify-between ${
        isRecommended
          ? 'border-brand-500/60 bg-slate-900/90 shadow-xl shadow-brand-950/40'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-3 right-6 bg-gradient-to-r from-brand-600 to-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current" />
          Best Proximity Match
        </div>
      )}

      <div>
        {/* Top identity row */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <img
            src={
              provider.avatar_url ||
              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
            }
            alt={provider.business_name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700/80 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-base md:text-lg truncate">
                {provider.business_name}
              </h3>
              {provider.is_demo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Verified Pro
                </span>
              )}
            </div>

            {/* Rating and jobs */}
            <div className="flex items-center gap-3 text-xs mt-1 text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                {provider.completed_jobs}+ jobs completed
              </span>
            </div>
          </div>
        </div>

        {/* Categories chips (strictly NO cleaning) */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.categories.slice(0, 3).map((cat, i) => (
            <span
              key={i}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-750"
            >
              {formatCategory(cat)}
            </span>
          ))}
          {provider.categories.length > 3 && (
            <span className="text-[10px] text-slate-500 px-1 py-0.5 self-center">
              +{provider.categories.length - 3} more
            </span>
          )}
        </div>

        {/* Distance & ETA info box */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="font-semibold text-white">{distance} km</span>
            <span className="text-slate-500 text-[11px]">away</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">{eta} mins</span>
            <span className="text-slate-500 text-[11px]">est. arrival</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Rate Range
          </span>
          <span className="text-base md:text-lg font-black text-white">
            ₹{provider.min_price} – ₹{provider.max_price}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(provider)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition transform hover:scale-105 active:scale-95 ${
            isRecommended
              ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand-900/50'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
        >
          <span>Select Provider</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ProviderCard;
