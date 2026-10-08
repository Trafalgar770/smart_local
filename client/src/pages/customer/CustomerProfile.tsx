import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Shield, MapPin, Calendar } from 'lucide-react';
import { DemoSwitcher } from '../../components/DemoSwitcher';

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Account Profile</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal details, emergency contact information, and role credentials.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.fullName}
              className="w-18 h-18 rounded-2xl object-cover border-2 border-brand-500/40 shadow-lg"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{user?.fullName || 'Rahul Sharma'}</h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email Address:</span>
              </span>
              <span className="font-semibold text-white">{user?.email || 'rahul.customer@demo.local'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Phone Number:</span>
              </span>
              <span className="font-semibold text-white">{user?.phone || '+91 98112 34567'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Primary City Area:</span>
              </span>
              <span className="font-semibold text-white">Central Delhi / Connaught Place</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Location Privacy Status:</span>
              </span>
              <span className="font-semibold text-emerald-400">Strict Temporary Consent Enforced</span>
            </div>
          </div>

          {/* Quick Switch Demo Persona */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400">Persona Switching:</p>
            <DemoSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};
