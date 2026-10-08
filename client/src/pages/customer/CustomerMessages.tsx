import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ServiceRequest, ChatMessage } from '../../types';
import { MessageSquare, Send, User, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerMessages: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequests()
      .then(res => {
        setRequests(res.requests);
        if (res.requests.length) {
          setSelectedRequestId(res.requests[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRequestId) return;
    api.getMessages(selectedRequestId)
      .then(res => setMessages(res.messages))
      .catch(console.error);

    const timer = setInterval(() => {
      api.getMessages(selectedRequestId)
        .then(res => setMessages(res.messages))
        .catch(console.error);
    }, 4000);

    return () => clearInterval(timer);
  }, [selectedRequestId]);

  const activeRequest = requests.find(r => r.id === selectedRequestId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newMessage.trim() || !activeRequest?.provider) return;

    try {
      const res = await api.sendMessage({
        requestId: selectedRequestId,
        receiverId: activeRequest.provider.userId,
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, res.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-brand-400" />
            <span>Service Communication Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time chat with your assigned service technicians & roadside mechanics.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-400">No active request threads found.</p>
            <Link to="/customer/ai" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              Create a Service Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thread selector list */}
            <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Active Threads</p>
              <div className="space-y-1">
                {requests.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRequestId(r.id)}
                    className={`w-full text-left p-3 rounded-xl transition text-xs block ${
                      r.id === selectedRequestId
                        ? 'bg-brand-950/60 border border-brand-500/40 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-white">{r.provider?.businessName || 'Service Provider'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{r.problemDescription}</p>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold mt-1 block">
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Window */}
            <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-[520px]">
              {activeRequest ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-white text-sm">{activeRequest.provider?.businessName}</h3>
                      <p className="text-[11px] text-slate-400">{activeRequest.service?.name} • Req #{activeRequest.id.slice(-8)}</p>
                    </div>
                    <Link
                      to={`/customer/tracking/${activeRequest.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-brand-400 flex items-center space-x-1 border border-slate-700"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </Link>
                  </div>

                  {/* Message feed */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1 text-xs">
                    {messages.length === 0 ? (
                      <p className="text-slate-500 text-center py-10 italic">No messages sent yet. Send instructions or directions.</p>
                    ) : (
                      messages.map(m => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl max-w-[80%] ${
                            m.senderId === activeRequest.customerId
                              ? 'bg-brand-900/50 border border-brand-700 ml-auto text-brand-100'
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

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-3 border-t border-slate-800">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message to the provider..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition shadow-md shadow-brand-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Select a request thread from the list.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
