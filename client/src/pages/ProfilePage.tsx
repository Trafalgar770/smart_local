import React, { useState } from 'react';
import {
  User,
  MapPin,
  Shield,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';

export function ProfilePage() {
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [email, setEmail] = useState('rahul.sharma@example.in');
  const [defaultAddress, setDefaultAddress] = useState(
    'Flat 402, Green Glen Layout, Bellandur, Bangalore 560103'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Customer Profile & Privacy Hub
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your verified contact details, stored home coordinates, and privacy preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and privacy preferences updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>Primary Service Address</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Default Address / Society Landmark
              </label>
              <textarea
                rows={2}
                value={defaultAddress}
                onChange={e => setDefaultAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Privacy Protocols Invariant</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your exact GPS coordinates are guarded under zero-compromise privacy invariants:
            </p>

            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>No GPS polling or vector broadcast occurs without explicit modal approval.</li>
              <li>Coordinates cease broadcasting immediately once a job is COMPLETED or CANCELLED.</li>
              <li>You can revoke active location broadcast at any instant with a single tap.</li>
            </ul>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
