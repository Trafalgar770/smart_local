import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from './DemoSwitcher';
import {
  Sparkles,
  Wrench,
  Navigation,
  Clock,
  MessageSquare,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  Activity,
  DollarSign
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isCustomer = user?.role === 'customer';
  const isProvider = user?.role === 'provider';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center space-x-1">
                  <span>SMART LOCAL</span>
                  <span className="text-brand-400">SERVICE</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 ml-1 font-mono">
                    IN 🇮🇳
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
                  AI-Powered Diagnostics & Roadside Rescue
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Public Quick Action Links */}
            <Link
              to="/analyze"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                isActive('/analyze')
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI Diagnostics</span>
            </Link>

            <Link
              to="/providers"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                isActive('/providers')
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Find Providers</span>
            </Link>

            <Link
              to="/services"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive('/services')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Services
            </Link>

            <Link
              to="/safety"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive('/safety')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Safety
            </Link>

            {isCustomer && (
              <>
                <Link
                  to="/customer/history"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/customer/history')
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Bookings</span>
                </Link>
              </>
            )}

            {isProvider && (
              <>
                <Link
                  to="/provider"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/provider')
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/provider/requests"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/provider/requests')
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Incoming</span>
                </Link>

                <Link
                  to="/provider/jobs"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/provider/jobs')
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Jobs</span>
                </Link>

                <Link
                  to="/provider/earnings"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    isActive('/provider/earnings')
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Earnings</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Demo Quick Persona Switcher */}
            <DemoSwitcher />

            {/* Profile / User dropdown */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={isCustomer ? '/customer/profile' : '/provider/profile'}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
                  title="View Profile"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-brand-500/50"
                  />
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                    {user.fullName.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {isCustomer && (
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Customer Actions</p>
              <Link
                to="/customer/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                🤖 AI Problem Diagnosis
              </Link>
              <Link
                to="/customer/providers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                📍 Nearby Providers
              </Link>
              <Link
                to="/customer/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                📜 My Requests & Tracking
              </Link>
              <Link
                to="/customer/assistance"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                💡 AI Diagnostic History
              </Link>
              <Link
                to="/customer/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                💬 Active Chat
              </Link>
            </div>
          )}

          {isProvider && (
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Provider Dashboard</p>
              <Link
                to="/provider"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                📊 Overview
              </Link>
              <Link
                to="/provider/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                🔔 Incoming Requests
              </Link>
              <Link
                to="/provider/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                🚗 Active Jobs & Live Progress
              </Link>
              <Link
                to="/provider/earnings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                💰 Earnings
              </Link>
            </div>
          )}

          <div className="pt-2 space-y-1">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-brand-300 font-semibold hover:bg-slate-800"
            >
              ⚡ AI Diagnostics (Direct Intake)
            </Link>
            <Link
              to="/providers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              📍 Find Verified Providers
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Explore 17 Local Services
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              About the Platform
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Safety Protocols & Helplines
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
