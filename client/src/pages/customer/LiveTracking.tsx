import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceRequest, ChatMessage, LocationShare } from '../../types';
import { LeafletMap } from '../../components/LeafletMap';
import { StarRating } from '../../components/StarRating';
import { ShareTrackingButton } from '../../components/ShareTrackingButton';
import {
  Navigation,
  Shield,
  ShieldAlert,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  X,
  Star,
  Sparkles,
  MapPin,
  ArrowRight
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'request_sent', label: 'Request Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'service_started', label: 'Work Started' },
  { key: 'completed', label: 'Completed' },
];

export const LiveTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // requestId
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationShare, setLocationShare] = useState<LocationShare | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);

  // Review modal state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      const res = await api.getRequestById(id);
      setRequest(res.request);
      setLocationShare(res.request.locationShare || null);
      setMessages(res.request.messages || []);
      if (res.request.review) {
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, 6000); // Polling for live status updates
    return () => clearInterval(interval);
  }, [id]);

  const handleStopSharing = async () => {
    if (!id) return;
    try {
      await api.updateLocationPermission(id, 'stopped');
      fetchRequest();
    } catch (err) {
      console.error('Failed to stop sharing:', err);
    }
  };

  const handleRestartSharing = async () => {
    if (!id) return;
    try {
      await api.updateLocationPermission(id, 'shared');
      fetchRequest();
    } catch (err) {
      console.error('Failed to restart sharing:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMessage.trim() || !request?.provider) return;

    try {
      const sent = await api.sendMessage({
        requestId: id,
        receiverId: request.provider.userId,
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, sent.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !request?.provider) return;
    try {
      setSubmittingReview(true);
      await api.submitReview({
        requestId: id,
        providerId: request.provider.id,
        rating,
        reviewText,
      });
      setReviewSubmitted(true);
      fetchRequest();
    } catch (err: any) {
      alert('Review submission failed: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading live tracking session...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 glass-panel rounded-2xl text-center space-y-3 border border-slate-800">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="font-bold text-white text-base">Request Not Found</h3>
        <Link to="/customer/history" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          View Bookings
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === request.status);
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';
  const isSharingActive = locationShare?.permissionStatus === 'shared';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                REQUEST ID: #{request.id.slice(-8)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                isCompleted
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : isCancelled
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-brand-950 text-brand-400 border border-brand-800 animate-pulse'
              }`}>
                {request.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {request.service?.name || 'Local Service'} • {request.provider?.businessName || 'Assigned Technician'}
            </h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{request.customerAddress || 'Connaught Place, New Delhi'}</span>
            </p>
          </div>

          {/* Quick Contact & Share Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <ShareTrackingButton
              requestId={id!}
              serviceTitle={request.service?.name || request.problemDescription || 'Emergency Service'}
            />

            <button
              onClick={() => setIsCallOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Technician</span>
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center space-x-1.5 transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ({messages.length})</span>
            </button>
          </div>
        </div>

        {/* Status Stepper Progression */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] text-xs">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-3 right-1/2 left-[-50%] h-0.5 -z-0 transition-all ${
                        idx <= currentStepIndex ? 'bg-brand-500' : 'bg-slate-800'
                      }`}
                    />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] relative z-10 transition-all ${
                      isCurrent
                        ? 'bg-brand-500 text-slate-950 ring-4 ring-brand-500/20'
                        : isPast
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`mt-2 font-semibold text-[11px] ${
                      isCurrent ? 'text-brand-400' : isPast ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Sharing Privacy Status & Controls Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isSharingActive
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center space-x-2.5">
            <Shield className={`w-5 h-5 shrink-0 ${isSharingActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <p className="font-bold text-white text-xs">
                {isCompleted
                  ? '🔒 Location sharing automatically stopped (Job Completed)'
                  : isSharingActive
                  ? '📍 Temporary Live Location Sharing is ACTIVE'
                  : '⏸️ Location Sharing is STOPPED'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isCompleted
                  ? 'Your coordinates are now completely hidden from provider records.'
                  : isSharingActive
                  ? 'Coordinates are transmitted exclusively for this active service run.'
                  : 'Provider cannot see your live position until permission is granted again.'}
              </p>
            </div>
          </div>

          {!isCompleted && !isCancelled && (
            <div>
              {isSharingActive ? (
                <button
                  onClick={handleStopSharing}
                  className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs transition"
                >
                  Stop Sharing Location
                </button>
              ) : (
                <button
                  onClick={handleRestartSharing}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition"
                >
                  Resume Live Location
                </button>
              )}
            </div>
          )}
        </div>

        {/* Interactive Map Component */}
        <div className="space-y-2">
          <LeafletMap
            customerCoords={{
              lat: request.customerLatitude || 28.6315,
              lng: request.customerLongitude || 77.2167,
              label: 'You (Connaught Place)',
            }}
            providerCoords={{
              lat: request.provider?.latitude || 28.6410,
              lng: request.provider?.longitude || 77.2010,
              label: request.provider?.businessName || 'Technician',
            }}
            status={request.status}
            isSimulated={true}
            className="h-[420px] w-full"
          />
        </div>

        {/* Completed Job Review & Rating Section */}
        {isCompleted && (
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 space-y-4 bg-gradient-to-br from-slate-900 to-emerald-950/20 shadow-2xl">
            <div className="flex items-center space-x-2 text-brand-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Service Successfully Finished!</span>
            </div>

            {reviewSubmitted ? (
              <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-800 text-xs text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Your verified review and rating has been recorded.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-bold text-white text-base">Rate your service experience with {request.provider?.businessName}</h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Your Rating:</label>
                  <StarRating value={rating} onChange={setRating} size="lg" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Feedback / Comments:</label>
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="e.g. Prompt arrival, solved puncture smoothly, highly professional."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Chat Drawer */}
        {isChatOpen && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                <span>Chat with {request.provider?.businessName}</span>
              </h4>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-center py-4 italic">No messages yet. Send a message to coordinate arrival.</p>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      m.senderId === request.customerId
                        ? 'bg-brand-900/60 border border-brand-700 ml-auto text-brand-100'
                        : 'bg-slate-900 border border-slate-800 mr-auto text-slate-200'
                    }`}
                  >
                    <p className="text-[10px] text-slate-400 font-semibold mb-0.5">{m.senderName}</p>
                    <p className="leading-relaxed">{m.message}</p>
                    <p className="text-[9px] text-slate-500 text-right mt-1 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message (e.g. Waiting near Metro Gate 3)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Prototype Call Modal */}
        {isCallOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-xs w-full glass-panel p-6 rounded-3xl border border-slate-700 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Phone className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{request.provider?.businessName}</h4>
                <p className="text-xs text-slate-400 mt-1">Connecting Voice Call (Telephony Prototype)</p>
                <p className="font-mono text-sm text-emerald-400 mt-2 font-bold">{request.provider?.phone || '+91 98765 43210'}</p>
              </div>
              <button
                onClick={() => setIsCallOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Dialer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
