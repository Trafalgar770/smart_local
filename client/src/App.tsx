import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { ProtectedRoute } from './components/ProtectedRoute';

function CustomerTrackingWrapper() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated customer gets customer tracking view
  if (user && (user.role === 'customer' || user.role === 'admin')) {
    return <LiveTracking />;
  }

  // Shared link recipients (incognito / external users) seamlessly redirect to public tracking page
  return <Navigate to={`/tracking/${id}`} replace />;
}

// Public & Core Master Prompt Pages
import { Home } from './pages/Home';
import { AnalyzePage } from './pages/AnalyzePage';
import { ProvidersPage } from './pages/ProvidersPage';
import { RequestPage } from './pages/RequestPage';
import { TrackingPage } from './pages/TrackingPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { ServicesList } from './pages/ServicesList';
import { About } from './pages/About';
import { Safety } from './pages/Safety';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

// Customer Flow Legacy Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { AiAssistant } from './pages/customer/AiAssistant';
import { AiAnalysis } from './pages/customer/AiAnalysis';
import { ProviderList } from './pages/customer/ProviderList';
import { ProviderDetail } from './pages/customer/ProviderDetail';
import { RequestConfirm } from './pages/customer/RequestConfirm';
import { LiveTracking } from './pages/customer/LiveTracking';
import { RequestHistory } from './pages/customer/RequestHistory';
import { AssistanceHistory } from './pages/customer/AssistanceHistory';
import { CustomerMessages } from './pages/customer/CustomerMessages';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { IncomingRequests } from './pages/provider/IncomingRequests';
import { RequestDetail } from './pages/provider/RequestDetail';
import { ActiveJobs } from './pages/provider/ActiveJobs';
import { ProviderEarnings } from './pages/provider/ProviderEarnings';
import { ProviderMessages } from './pages/provider/ProviderMessages';
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
          <EmergencyBanner />
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Core Master Prompt Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/request/:providerId" element={<RequestPage />} />
              <Route path="/tracking/:requestId" element={<TrackingPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Informational & Auth Routes */}
              <Route path="/services" element={<ServicesList />} />
              <Route path="/about" element={<About />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/ai"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <AiAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/analysis/:id"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <AiAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/providers"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <ProviderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/providers/:id"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <ProviderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/request/:id"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <RequestConfirm />
                  </ProtectedRoute>
                }
              />
              <Route path="/customer/tracking/:id" element={<CustomerTrackingWrapper />} />
              <Route
                path="/customer/history"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <RequestHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/assistance"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <AssistanceHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/messages"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Master Prompt Provider Routes */}
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route
                path="/provider"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/requests"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <IncomingRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/requests/:id"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <RequestDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/jobs"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <ActiveJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/earnings"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <ProviderEarnings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/messages"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <ProviderMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/profile"
                element={
                  <ProtectedRoute allowedRole="provider">
                    <ProviderProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Error Routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
