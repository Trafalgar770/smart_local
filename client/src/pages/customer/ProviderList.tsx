import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ProviderProfile, ServiceDefinition } from '../../types';
import {
  Compass,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight,
  Phone,
  Zap
} from 'lucide-react';

export const ProviderList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId') || '';
  const navigate = useNavigate();

  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId);
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    api.getServices().then(res => setServices(res.services)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getNearbyProviders({
      serviceId: selectedServiceId || undefined,
      maxDistanceKm,
      minRating,
    })
      .then(res => setProviders(res.providers))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedServiceId, maxDistanceKm, minRating]);

  const handleCategoryChange = (newServiceId: string) => {
    setSelectedServiceId(newServiceId);
    if (newServiceId) {
      setSearchParams({ serviceId: newServiceId });
    } else {
      setSearchParams({});
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Compass className="w-6 h-6 text-brand-400" />
              <span>
                {selectedService ? `${selectedService.name} Providers` : 'Nearby Verified Providers'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ranked dynamically by service match, distance, response speed, and customer ratings in Delhi NCR.
            </p>
          </div>

          <Link
            to="/customer/ai"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-brand-400 border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <span>Run New AI Problem Check</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-300">Service:</span>
            <select
              value={selectedServiceId}
              onChange={e => handleCategoryChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All 17 Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Max Distance:</span>
            <select
              value={maxDistanceKm}
              onChange={e => setMaxDistanceKm(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Rating:</span>
            <select
              value={minRating || ''}
              onChange={e => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Locating and ranking nearby professionals...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-3 p-6">
            <MapPin className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No providers match current filter radius</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try expanding the distance radius to 25 km or clearing category filters.
            </p>
            <button
              onClick={() => { setSelectedServiceId(''); setMaxDistanceKm(25); setMinRating(undefined); }}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Ranked Providers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p, idx) => (
              <div
                key={p.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Ranking Ribbon */}
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-brand-500/20 border-b border-l border-brand-500/30 text-brand-300 text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-bl-xl">
                    ⚡ TOP MATCH • RANK #{idx + 1}
                  </div>
                )}

                <div className="flex items-start space-x-3.5">
                  <img
                    src={p.avatarUrl}
                    alt={p.businessName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-sm sm:text-base">{p.businessName}</h3>
                      {p.verified && (
                        <span title="Verified Service Professional">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center space-x-3 text-xs pt-1">
                      <span className="flex items-center space-x-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{p.averageRating.toFixed(1)}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{p.completedJobs} jobs done</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-400 font-medium capitalize">{p.availabilityStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Distance</p>
                    <p className="font-bold text-slate-200 mt-0.5">{p.distanceKm || '1.8'} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Est. Arrival</p>
                    <p className="font-bold text-sky-400 mt-0.5">{p.estimatedArrivalMinutes || '12'} mins</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Base Fee</p>
                    <p className="font-bold text-emerald-400 mt-0.5">₹{p.basePrice}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <Link
                    to={`/customer/providers/${p.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-center transition"
                  >
                    View Profile & Reviews
                  </Link>

                  <button
                    onClick={() => navigate(`/customer/request/${p.id}`, { state: { provider: p } })}
                    className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white text-center transition shadow-md shadow-brand-500/20"
                  >
                    Book Technician
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
