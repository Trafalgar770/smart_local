import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ServiceDefinition } from '../types';
import {
  Wrench,
  Search,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const ServicesList: React.FC = () => {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getServices()
      .then(res => setServices(res.services))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400">
            <span>Verified Technical Network • All India</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            17 Certified Service Domains
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            From high-speed roadside breakdown assistance to specialized civil and electrical repair technicians.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by symptom or service (e.g. tyre, leak, mcb, tow)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(service => (
              <div
                key={service.id}
                className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      ₹{service.typicalPriceMin} – ₹{service.typicalPriceMax}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Safety Tip:</p>
                    <p className="line-clamp-2 mt-0.5">{service.safetyAdvice}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <Link
                    to="/analyze"
                    state={{ category: service.slug.toUpperCase().replace(/-/g, '_'), problemDescription: `Need diagnostic assistance for ${service.name}: ${service.description}` }}
                    className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs text-center transition flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Diagnose</span>
                  </Link>

                  <Link
                    to="/providers"
                    state={{ category: service.slug.toUpperCase().replace(/-/g, '_') }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs text-center border border-slate-700 transition"
                  >
                    <span>View Providers</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
