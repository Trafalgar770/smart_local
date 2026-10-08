import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ServiceDefinition } from '../../types';
import { VoiceInputModal } from '../../components/VoiceInputModal';
import { ScanProblemModal } from '../../components/ScanProblemModal';
import {
  Sparkles,
  Mic,
  Camera,
  ArrowRight,
  ShieldAlert,
  Clock,
  Compass,
  Zap,
  HelpCircle
} from 'lucide-react';

const COMMON_SHORTCUTS = [
  { label: '🏍️ Bike won\'t start', prompt: 'My bike won\'t start, the starter is clicking and kick lever feels completely loose.', category: 'bike-mechanic' },
  { label: '🚗 Car won\'t start', prompt: 'Car engine won\'t crank, dashboard lights dim drastically when turning the key.', category: 'car-mechanic' },
  { label: '🛞 Flat tyre', prompt: 'Tubeless car tyre has lost all air pressure on the road, nail visible in tread.', category: 'puncture-repair' },
  { label: '⛽ No fuel', prompt: 'Stranded on the highway shoulder, vehicle ran completely out of petrol/diesel.', category: 'fuel-delivery' },
  { label: '🔧 Water leak', prompt: 'High-pressure water pipe leaking heavily under the bathroom sink near switchboard.', category: 'plumber' },
  { label: '⚡ Electrical problem', prompt: 'Main MCB tripped with a loud spark and persistent burning wire smell.', category: 'electrician' },
  { label: '❄️ AC not cooling', prompt: 'Split AC indoor unit running but blowing warm air and outdoor compressor not kicking in.', category: 'ac-repair' },
];

export const AiAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [problemDescription, setProblemDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getServices().then(res => setServices(res.services)).catch(console.error);
  }, []);

  const handleAnalyze = async (customPrompt?: string, categoryHint?: string) => {
    const textToSubmit = customPrompt || problemDescription;
    if (!textToSubmit.trim()) return;

    try {
      setLoading(true);
      const res = await api.analyzeProblem(textToSubmit, categoryHint || selectedCategory);
      const sessId = res.analysis?.sessionId || (res as any).sessionId || `sess-${Date.now()}`;
      navigate(`/customer/analysis/${sessId}`, {
        state: { analysis: res.analysis },
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      alert('Unable to analyze problem: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptReady={transcript => {
          setProblemDescription(transcript);
          handleAnalyze(transcript);
        }}
      />
      <ScanProblemModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Before The Service Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            What's wrong? Let AI help you figure it out.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Describe your problem and we'll guide you through a quick optional checklist before connecting you with the right local professional.
          </p>
        </div>

        {/* Input Box */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Describe the symptoms or situation:
            </label>
            <textarea
              rows={4}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="Describe your problem... (e.g. Bike suddenly stalled on highway, or bathroom tap broken flooding the room)"
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-sm border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none transition"
            />
          </div>

          {/* Optional Category Hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Category Hint (Optional):</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Auto-Detect with AI</option>
                {services.map(s => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            <Link
              to="/customer/assistance"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>View Past Diagnostics</span>
            </Link>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
              >
                <Mic className="w-3.5 h-3.5 text-brand-400" />
                <span>🎤 Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScanOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>📷 Scan Problem</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={loading || !problemDescription.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Running Diagnostic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Click A Common Problem to Test:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMON_SHORTCUTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProblemDescription(item.prompt);
                  setSelectedCategory(item.category);
                  handleAnalyze(item.prompt, item.category);
                }}
                className="text-left p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span className="font-medium">{item.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
