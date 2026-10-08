import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ProviderCard, ProviderItem } from '../components/ProviderCard';
import {
  Filter,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Search,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Share2,
  Check,
  Copy
} from 'lucide-react';

export function ProvidersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryState = (location.state as any) || {};
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory || queryState.category || 'ALL'
  );
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Default coordinate center (e.g. Bangalore center)
  const [userLat, setUserLat] = useState<number>(12.9716);
  const [userLng, setUserLng] = useState<number>(77.5946);

  useEffect(() => {
    // Try to get current position if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // Sync category or search changes to URL query parameters
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const newParams: Record<string, string> = {};
    if (catId && catId !== 'ALL') newParams.category = catId;
    if (searchQuery) newParams.search = searchQuery;
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams: Record<string, string> = {};
    if (selectedCategory && selectedCategory !== 'ALL') newParams.category = selectedCategory;
    if (val) newParams.search = val;
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, userLat, userLng]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'ALL') {
        q.append('category', selectedCategory);
      }
      q.append('lat', userLat.toString());
      q.append('lng', userLng.toString());

      const res = await fetch(`/api/providers/match?${q.toString()}`);
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookProvider = (p: ProviderItem) => {
    navigate(`/request/${p.id}`, {
      state: {
        provider: p,
        category: selectedCategory !== 'ALL' ? selectedCategory : p.categories[0],
      },
    });
  };

  const handleCopyDirectoryShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/providers?category=${encodeURIComponent(selectedCategory)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    } catch (_) {}
  };

  // Filter & sort
  const filtered = providers
    .filter(p => {
      if (!searchQuery) return true;
      return (
        p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance_km ?? 99) - (b.distance_km ?? 99);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price') {
        return a.min_price - b.min_price;
      }
      return 0;
    });

  const CATEGORY_CHIPS = [
    { id: 'ALL', label: 'All Services' },
    { id: 'BIKE_MECHANIC', label: 'Bike Mechanic' },
    { id: 'CAR_MECHANIC', label: 'Car Mechanic' },
    { id: 'FUEL_DELIVERY', label: 'Fuel Delivery' },
    { id: 'BATTERY_JUMPSTART', label: 'Battery Jumpstart' },
    { id: 'PUNCTURE_REPAIR', label: 'Puncture Repair' },
    { id: 'TOWING', label: 'Towing' },
    { id: 'ELECTRICIAN', label: 'Electrician' },
    { id: 'PLUMBER', label: 'Plumber' },
    { id: 'AC_REPAIR', label: 'AC Repair' },
    { id: 'CARPENTER', label: 'Carpenter' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AI Diagnosis</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDirectoryShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Share this filtered directory link"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Share Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Share Directory Link</span>
                </>
              )}
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Bangalore Metro Region</span>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Matched Service Providers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Distance-ranked technicians equipped with certified tooling and live navigation readiness.
          </p>
        </div>

        {/* Filter bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleCategorySelect(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCategory === chip.id
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-950/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search provider by name..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
              >
                <option value="distance">Proximity (Nearest First)</option>
                <option value="rating">Top Rated (⭐)</option>
                <option value="price">Lowest Starting Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Scanning local area dispatch nodes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No active technicians in this category right now</p>
            <p className="text-xs text-slate-500">
              Try switching category filter or resetting your search term.
            </p>
            <button
              type="button"
              onClick={() => handleCategorySelect('ALL')}
              className="mt-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition"
            >
              Reset to All Providers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onSelect={handleBookProvider}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProvidersPage;
