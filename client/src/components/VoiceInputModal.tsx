import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, RefreshCw } from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const sampleVoicePrompts = [
    'My bike engine stopped on the highway, kick starter feels completely loose and starter just clicks.',
    'Water pipe has burst under the kitchen sink and water is flooding towards the main switchboard.',
    'Car radiator is smoking with white steam and temperature gauge is in the red zone.',
    'Main MCB tripped with a loud spark and burning plastic smell in the bedroom.',
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setTranscript(current.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // If browser speech permission fails, simulate recording
          simulateRecording();
        }
      } else {
        // Fallback simulation
        simulateRecording();
      }
    }
  };

  const simulateRecording = () => {
    setIsListening(true);
    setTranscript('Listening to your voice...');
    setTimeout(() => {
      const randomPrompt = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
      setTranscript(randomPrompt);
      setIsListening(false);
    }, 2500);
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-md w-full glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Voice Problem Input</h3>
              <p className="text-[11px] text-slate-400">Speak naturally in English or Hinglish</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Mic Button */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping"></div>
            )}
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl relative z-10 ${
                isListening
                  ? 'bg-red-600 ring-8 ring-red-500/20 scale-105'
                  : 'bg-brand-600 hover:bg-brand-500 ring-4 ring-brand-500/20'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-slate-300">
              {isListening ? 'Listening... Speak now' : 'Tap microphone to start speaking'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Supports real mic and simulated speech test</p>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-h-[90px] flex flex-col justify-between">
          <p className="text-xs text-slate-200 italic leading-relaxed">
            {transcript || 'Your transcribed speech will appear here...'}
          </p>
          {transcript && (
            <p className="text-[10px] text-emerald-400 font-mono mt-2 flex items-center space-x-1">
              <span>✓ Voice input captured</span>
            </p>
          )}
        </div>

        {/* Instant Sample Voice Clips for Hackathon Demo */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Or Quick-Pick A Voice Simulation:</span>
            <Sparkles className="w-3 h-3 text-brand-400" />
          </p>
          <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {sampleVoicePrompts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(sample)}
                className="text-left text-[11px] p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center space-x-2"
              >
                <Volume2 className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="truncate">{sample}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:pointer-events-none text-xs font-semibold text-white transition shadow-lg shadow-brand-500/20"
          >
            Apply & Analyze
          </button>
        </div>
      </div>
    </div>
  );
};
