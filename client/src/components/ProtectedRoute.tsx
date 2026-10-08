import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'customer' | 'provider';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Authenticating Smart Local Service session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl glass-panel border border-red-500/30 text-center space-y-4">
        <div className="w-12 h-12 bg-red-950/80 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-800">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-300">
          This screen is reserved strictly for <strong>{allowedRole}s</strong>. You are currently authenticated as a <strong>{user.role}</strong> ({user.fullName}).
        </p>
        <div className="pt-2">
          <Navigate to={user.role === 'provider' ? '/provider' : '/customer'} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
