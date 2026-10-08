import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-5 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto text-2xl font-mono font-extrabold">
          404
        </div>
        <h1 className="text-2xl font-bold text-white">Destination Page Not Found</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested service route or diagnostic ticket does not exist or has moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Return to Smart Local Service Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
