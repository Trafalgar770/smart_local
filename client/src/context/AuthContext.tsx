import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ProviderProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  providerProfile: ProviderProfile | null;
  isLoading: boolean;
  activePersona: 'customer' | 'provider-mechanic' | 'provider-electrician' | 'custom';
  login: (email: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  switchPersona: (persona: 'customer' | 'provider-mechanic' | 'provider-electrician') => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<'customer' | 'provider-mechanic' | 'provider-electrician' | 'custom'>('customer');

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMe();
      setUser(res.user);
      setProviderProfile(res.providerProfile);
      if (res.user?.id === 'cust-rahul-01') setActivePersona('customer');
      else if (res.user?.id === 'prov-user-vikram') setActivePersona('provider-mechanic');
      else if (res.user?.id === 'prov-user-rajesh') setActivePersona('provider-electrician');
      else setActivePersona('custom');
    } catch (err) {
      console.warn('Auth check failed:', err);
      // Fallback: Default to demo customer Rahul Sharma
      try {
        const demoRes = await api.demoSwitch('customer');
        setUser(demoRes.user);
        setProviderProfile(demoRes.providerProfile);
        setActivePersona('customer');
      } catch (e) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      localStorage.setItem('sls_token', res.token);
      localStorage.setItem('sls_demo_user_id', res.user.id);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('sls_token', res.token);
      localStorage.setItem('sls_demo_user_id', res.user.id);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProviderProfile(null);
  };

  const switchPersona = async (persona: 'customer' | 'provider-mechanic' | 'provider-electrician') => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(persona);
      localStorage.setItem('sls_token', res.token);
      localStorage.setItem('sls_demo_user_id', res.user.id);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
      setActivePersona(persona);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        isLoading,
        activePersona,
        login,
        register,
        logout,
        switchPersona,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
