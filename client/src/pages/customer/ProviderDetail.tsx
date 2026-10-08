import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ProviderProfile, Review, ServiceDefinition } from '../../types';
import { StarRating } from '../../components/StarRating';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  MessageSquare,
  Wrench,
  Award
} from 'lucide-react';

export const ProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offeredServices, setOfferedServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProviderById(id)
      .then(res => {
        setProvider(res.provider);
        setReviews(res.reviews);
        setOfferedServices(res.offeredServices);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading verified technician profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 glass-panel rounded-2xl text-center space-y-3 border border-slate-800">
        <h3 className="font-bold text-white text-base">Provider Not Found</h3>
        <p className="text-xs text-slate-400">The requested service partner could not be located.</p>
        <Link to="/customer/providers" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Back to Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-500/40 shadow-xl"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">{provider.businessName}</h1>
                  {provider.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center space-x-1 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center space-x-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{provider.averageRating.toFixed(2)}</span>
                  </span>
                  <span className="text-slate-400">({reviews.length} reviews)</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300">{provider.completedJobs} jobs completed</span>
                </div>

                <p className="text-xs text-slate-400 flex items-center space-x-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{provider.serviceArea}</span>
                </p>
              </div>
            </div>

            {/* Quick Booking CTA */}
            <div className="sm:self-center shrink-0 w-full sm:w-auto text-center sm:text-right space-y-2">
              <p className="text-xs text-slate-400">Inspection & Visiting Fee</p>
              <p className="text-2xl font-extrabold text-brand-400">₹{provider.basePrice}</p>
              <button
                onClick={() => navigate(`/customer/request/${provider.id}`, { state: { provider } })}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
              >
                <span>Request Service Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
            {provider.description}
          </div>
        </div>

        {/* Services Offered */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-brand-400" />
            <span>Offered Service Capabilities</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {offeredServices.map(srv => (
              <div key={srv.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{srv.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{srv.description}</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">₹{srv.typicalPriceMin} – ₹{srv.typicalPriceMax}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span>Verified Customer Reviews ({reviews.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">100% Genuine Post-Service Feedback</span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet for this provider.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">{rev.customerName || 'Customer'}</span>
                    <StarRating value={rev.rating} readOnly size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
