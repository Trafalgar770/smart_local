import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Navigation, Heart, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">
                SMART LOCAL <span className="text-brand-400">SERVICE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's intelligent on-demand local services & emergency roadside platform. Combining AI problem triage, dynamic safety checklists, and temporary permission-based live tracking.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Location shared ONLY during active jobs</span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Popular Services</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/services" className="hover:text-white transition">🏍️ Bike Mechanic & Towing</Link></li>
              <li><Link to="/services" className="hover:text-white transition">🚗 Car Mechanic & Jump Start</Link></li>
              <li><Link to="/services" className="hover:text-white transition">⚡ Electrician & Power Fixes</Link></li>
              <li><Link to="/services" className="hover:text-white transition">🔧 Plumber & Pipe Leaks</Link></li>
              <li><Link to="/services" className="hover:text-white transition">⛽ Roadside Fuel Delivery</Link></li>
              <li><Link to="/services" className="hover:text-white transition">🛞 Puncture & Tyre Patching</Link></li>
              <li><Link to="/services" className="hover:text-white transition">❄️ AC Repair & Cooling</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Product & Workflow</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/analyze" className="hover:text-white transition">AI Diagnostic Engine</Link></li>
              <li><Link to="/services" className="hover:text-white transition">All 17 Certified Categories</Link></li>
              <li><Link to="/safety" className="hover:text-white transition">Safety Checklists & Guidelines</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Our Architecture</Link></li>
              <li><Link to="/provider" className="hover:text-white transition">Join as Service Partner</Link></li>
            </ul>
          </div>

          {/* Emergency & Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5" />
              <span>India Emergency SOS</span>
            </h4>
            <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span>National Emergency:</span>
                <span className="font-bold text-white">112</span>
              </div>
              <div className="flex justify-between items-center">
                <span>National Highway (NHAI):</span>
                <span className="font-bold text-amber-400">1073</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ambulance Service:</span>
                <span className="font-bold text-white">108</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fire Brigade:</span>
                <span className="font-bold text-white">101</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: This application is a hackathon-ready interactive system. Real-world emergency calls must use standard telecommunication lines.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} SMART LOCAL SERVICE India. Production Architecture.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for Local Bharat</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-mono">Status: All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
