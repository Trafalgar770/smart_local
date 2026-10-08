import React from 'react';
import { ShieldAlert, Phone, AlertTriangle, Zap, Flame, Droplets, Car, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Safety: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Protocols & Helplines (India)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Safety & Emergency Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            What to do immediately before professional technicians arrive. Protect your family and fellow commuters.
          </p>
        </div>

        {/* Indian Emergency Hotline Directory */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 space-y-4 bg-gradient-to-br from-slate-900 to-red-950/20 shadow-2xl">
          <h3 className="font-extrabold text-white text-lg flex items-center space-x-2">
            <Phone className="w-5 h-5 text-red-400" />
            <span>National Emergency Telephony Hotlines (India)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <a href="tel:1073" className="p-4 rounded-2xl bg-slate-900/90 border border-red-800/60 hover:border-red-500 transition block">
              <span className="text-[10px] uppercase font-bold text-slate-400">NHAI Expressway SOS</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">1073</p>
              <p className="text-[10px] text-slate-500">24x7 Roadside Patrol</p>
            </a>

            <a href="tel:112" className="p-4 rounded-2xl bg-slate-900/90 border border-red-800/60 hover:border-red-500 transition block">
              <span className="text-[10px] uppercase font-bold text-slate-400">Police / Unified SOS</span>
              <p className="text-2xl font-extrabold text-red-400 mt-1">112</p>
              <p className="text-[10px] text-slate-500">Pan-India Emergency</p>
            </a>

            <a href="tel:108" className="p-4 rounded-2xl bg-slate-900/90 border border-red-800/60 hover:border-red-500 transition block">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ambulance</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">108</p>
              <p className="text-[10px] text-slate-500">Medical Trauma Care</p>
            </a>

            <a href="tel:101" className="p-4 rounded-2xl bg-slate-900/90 border border-red-800/60 hover:border-red-500 transition block">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fire & Rescue</span>
              <p className="text-2xl font-extrabold text-orange-400 mt-1">101</p>
              <p className="text-[10px] text-slate-500">Fire Brigade</p>
            </a>
          </div>
        </div>

        {/* Hazard Protocols */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-white">Emergency Action Protocols</h3>

          {/* Highway Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2 text-sky-400">
              <Car className="w-4 h-4" />
              <span>1. Stranded Vehicle on Highway or Expressway</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Turn on hazard warning blinkers immediately. Steer as far onto the left shoulder as safely possible. Place your reflective hazard triangle at least 30 meters behind your vehicle. Never remain sitting inside a stranded vehicle if heavy truck traffic is approaching fast—stand safely behind the steel crash guardrail.
            </p>
          </div>

          {/* Electrical Spark & MCB Tripping */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2 text-amber-400">
              <Zap className="w-4 h-4" />
              <span>2. Electrical Sparks or Burning Insulation Odor</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Do not touch switchboards with wet hands or bare feet. Flip the main incoming MCB switch off immediately. Never extinguish an electrical fire with water; use dry chemical powder (ABC fire extinguisher) or dry sand.
            </p>
          </div>

          {/* Radiator Boiling */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2 text-rose-400">
              <Flame className="w-4 h-4" />
              <span>3. Engine Overheating & Radiator Boiling</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              NEVER open a hot radiator pressure cap! Pressurized coolant exceeds 110°C and will erupt like a geyser, causing catastrophic face and hand burns. Turn off ignition, pop the hood latch from inside, and allow at least 35–45 minutes for engine cooldown.
            </p>
          </div>

          {/* Water Leak */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2 text-blue-400">
              <Droplets className="w-4 h-4" />
              <span>4. High-Pressure Water Pipe Burst</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Locate and turn off the primary overhead water valve / stopcock. If water is pooling within 2 meters of extension cords, refrigerators, or low floor sockets, switch off room electricity first before walking through standing water.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link to="/" className="text-xs text-brand-400 hover:text-brand-300 font-semibold underline">
            ← Return to Smart Local Service Home
          </Link>
        </div>
      </div>
    </div>
  );
};
