import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  Camera,
  ArrowRight,
  Flame,
  Wrench,
  Zap,
  Bike,
  Disc,
  Upload,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface AiIntakeHubProps {
  onAnalyze: (description: string, inputType: 'TEXT' | 'VOICE' | 'VISION', imageBase64?: string) => void;
  isLoading?: boolean;
}

const PRESET_CHIPS = [
  { label: "Bike won't start on road", icon: Bike, type: 'roadside' },
  { label: 'Burning smell from switchboard', icon: Flame, type: 'emergency' },
  { label: 'Severe pipe leakage under sink', icon: Wrench, type: 'home' },
  { label: 'Flat tyre, tubeless puncture', icon: Disc, type: 'roadside' },
  { label: 'MCB breaker tripping repeatedly', icon: Zap, type: 'home' },
  { label: 'Ran out of fuel on highway', icon: Flame, type: 'roadside' },
];

export function AiIntakeHub({ onAnalyze, isLoading = false }: AiIntakeHubProps) {
  const [problemText, setProblemText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problemText.trim() && !imagePreview) return;

    const inputType = imagePreview ? 'VISION' : isVoiceActive ? 'VOICE' : 'TEXT';
    onAnalyze(
      problemText.trim() || 'Visual photo inspection submitted for diagnostic breakdown',
      inputType,
      imagePreview || undefined
    );
  };

  const handlePresetClick = (preset: string) => {
    setProblemText(preset);
    onAnalyze(preset, 'TEXT');
  };

  const handleStartVoice = () => {
    setIsVoiceActive(true);
    setVoiceSeconds(0);
    const interval = setInterval(() => {
      setVoiceSeconds(s => {
        if (s >= 3) {
          clearInterval(interval);
          setIsVoiceActive(false);
          const simulated = "My motorcycle engine stalled suddenly in traffic and won't turn on again";
          setProblemText(simulated);
          return 3;
        }
        return s + 1;
      });
    }, 1000);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        if (!problemText) {
          setProblemText('Diagnostic visual scan of damaged component');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full relative">
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            LocalHelp AI • India&apos;s Smart Emergency & Home Diagnostics
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Describe your problem in your own words.
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2">
            No technical knowledge required. LocalHelp AI detects hazards, prepares safe checks, and dispatches verified technicians across Indian cities.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="relative rounded-xl bg-slate-900/90 border-2 border-slate-700 focus-within:border-brand-500 transition-all shadow-inner">
            <textarea
              id="ai-intake-input"
              rows={3}
              value={problemText}
              onChange={e => setProblemText(e.target.value)}
              placeholder="e.g. My bike won't start on the ring road, or there's a loud buzzing noise and burnt smell near my kitchen MCB..."
              className="w-full bg-transparent text-white placeholder-slate-500 px-4 py-3.5 text-base md:text-lg resize-none focus:outline-none"
              disabled={isLoading}
            />

            {/* Image Preview Thumbnail if attached */}
            {imagePreview && (
              <div className="px-4 pb-3 flex items-center gap-3">
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Upload thumbnail"
                    className="w-16 h-16 object-cover rounded-lg border border-brand-500/50 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 text-xs shadow hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-xs text-brand-300 font-medium">
                  Photo attached for optical diagnostic breakdown
                </span>
              </div>
            )}

            {/* Input Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 bg-slate-950/60 border-t border-slate-800 rounded-b-xl">
              <div className="flex items-center gap-2">
                {/* Voice Trigger Button */}
                <button
                  type="button"
                  id="voice-trigger-btn"
                  onClick={handleStartVoice}
                  disabled={isLoading || isVoiceActive}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isVoiceActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Speak your problem"
                >
                  <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-red-400 animate-bounce' : ''}`} />
                  {isVoiceActive ? `Listening... (${voiceSeconds}s)` : 'Voice Input'}
                </button>

                {/* Photo Upload Trigger Button */}
                <label
                  htmlFor="photo-upload-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition"
                  title="Upload problem photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Photo</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                id="ai-submit-intake-btn"
                disabled={isLoading || (!problemText.trim() && !imagePreview)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Problem...</span>
                  </>
                ) : (
                  <>
                    <span>Diagnose Problem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Problem Preset Chips */}
          <div className="pt-2">
            <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <span>Quick Presets:</span>
              <span className="text-slate-500 text-[11px]">(Click any to auto-fill & diagnose)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_CHIPS.map((chip, idx) => {
                const Icon = chip.icon;
                const isEmergency = chip.type === 'emergency';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(chip.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition border ${
                      isEmergency
                        ? 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-750 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AiIntakeHub;
