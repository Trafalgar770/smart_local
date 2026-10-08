import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ServiceDefinition, ProviderProfile } from '../../types';
import { Wrench, MapPin, Phone, ShieldCheck, CheckCircle2, Star, Save } from 'lucide-react';
import { DemoSwitcher } from '../../components/DemoSwitcher';

export const ProviderProfilePage: React.FC = () => {
  const { user, providerProfile } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(providerProfile);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    providerProfile?.serviceIds || []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getServices().then(res => setServices(res.services));
  }, []);

  const toggleService = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter(id => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Provider Business Profile</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your technical expertise categories, dispatch radius, and contact information.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile and technical category settings updated successfully!</span>
          </div>
        )}

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
              alt={profile?.businessName}
              className="w-18 h-18 rounded-2xl object-cover border-2 border-brand-500/40 shadow-lg"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{profile?.businessName || 'Vikram Auto & Roadside Rescue'}</h2>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30">
                  Certified Technician
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{profile?.averageRating?.toFixed(2) || '4.88'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Primary Dispatch Phone:</span>
              </span>
              <span className="font-semibold text-white">{profile?.phone || user?.phone || '+91 98765 43210'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Service Coverage Area:</span>
              </span>
              <span className="font-semibold text-white">{profile?.serviceArea || 'Central & West Delhi (Within 12 km)'}</span>
            </div>
          </div>

          {/* Service Categories Multi-Select (Strictly NO cleaning) */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Services Offered by Your Garage / Team</h4>
              <span className="text-xs text-brand-400 font-mono">{selectedServices.length} active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {services.map(srv => {
                const isSelected = selectedServices.includes(srv.id);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleService(srv.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-950/60 border-brand-500/50 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{srv.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <DemoSwitcher />
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-brand-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
