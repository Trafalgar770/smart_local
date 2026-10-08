import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, UserCheck, Wrench, Shield, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { user, activePersona, switchPersona } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (persona: 'customer' | 'provider-mechanic' | 'provider-electrician') => {
    try {
      setSwitching(true);
      await switchPersona(persona);
      setIsOpen(false);
      if (persona === 'customer') {
        navigate('/customer');
      } else {
        navigate('/provider');
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition text-slate-200 shadow-sm"
        title="1-Click Demo Persona Switcher for Hackathon"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-medium text-slate-400">Demo Persona:</span>
        <span className="font-bold text-emerald-400">
          {user ? user.fullName : 'Guest'} ({user ? user.role : 'None'})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel shadow-2xl p-2 z-50 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>⚡ Hackathon Quick Switcher</span>
              <span className="text-[10px] text-emerald-400 font-mono">1-Click Login</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantly toggle roles to test customer AI diagnostics vs. provider dispatch live tracking.
            </p>
          </div>

          <div className="space-y-1 mt-2">
            <button
              onClick={() => handleSwitch('customer')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-start space-x-2.5 transition ${
                activePersona === 'customer'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">Rahul Sharma</span>
                  {activePersona === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Customer • Has active bike breakdown in Delhi</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitch('provider-mechanic')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-start space-x-2.5 transition ${
                activePersona === 'provider-mechanic'
                  ? 'bg-amber-950/70 border border-amber-500/40 text-amber-200'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">Vikram Singh</span>
                  {activePersona === 'provider-mechanic' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Provider • Vikram Auto & Roadside Rescue (Active)</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitch('provider-electrician')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-start space-x-2.5 transition ${
                activePersona === 'provider-electrician'
                  ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">Rajesh Kumar</span>
                  {activePersona === 'provider-electrician' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Provider • Rajesh Certified Electricals (Available)</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
