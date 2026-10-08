import React, { useState } from 'react';
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertTriangle, Scan } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ScanProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (analysis: any) => void;
}

const SAMPLE_SCENARIOS = [
  {
    title: '🏍️ Flat Tyre / Nail Puncture',
    imgUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
    note: 'Rear tubeless tyre punctured with visible metal nail, air pressure zero.',
  },
  {
    title: '🔧 Kitchen Pipe Seepage & Burst',
    imgUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
    note: 'Under-sink diverter joint leaking water continuously across the floor.',
  },
  {
    title: '⚡ Burnt MCB Electrical Board',
    imgUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500',
    note: 'Main distribution box MCB blackened with melted plastic smell.',
  },
  {
    title: '❄️ AC Split Coil Ice Buildup',
    imgUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500',
    note: 'Thick white ice frozen on AC cooling coil, room blowing warm air.',
  },
];

export const ScanProblemModal: React.FC<ScanProblemModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_SCENARIOS[0].imgUrl);
  const [notes, setNotes] = useState<string>(SAMPLE_SCENARIOS[0].note);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setNotes('Custom photo uploaded: Suspected damage / failure point.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteScan = async () => {
    try {
      setScanning(true);
      setScanProgress(25);

      const progressTimer = setInterval(() => {
        setScanProgress(p => (p < 85 ? p + 20 : p));
      }, 300);

      const res = await api.scanProblem(selectedImage, notes);
      clearInterval(progressTimer);
      setScanProgress(100);

      setTimeout(() => {
        setScanning(false);
        onClose();
        if (onScanComplete) {
          onScanComplete(res.analysis);
        } else {
          navigate(`/customer/analysis/${res.analysis.sessionId}`, {
            state: { analysis: res.analysis },
          });
        }
      }, 500);
    } catch (err) {
      console.error('Scan failed:', err);
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-lg w-full glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Visual Fault Diagnostic Scanner</h3>
              <p className="text-[11px] text-slate-400">Computer Vision & Optical Problem Inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Viewport Container */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-56 flex items-center justify-center group">
          <img
            src={selectedImage}
            alt="Problem preview"
            className="w-full h-full object-cover opacity-85"
          />

          {/* Futuristic HUD Scanning Grid */}
          <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/30 m-3 rounded-lg flex flex-col justify-between p-2">
            <div className="flex justify-between items-start text-[10px] font-mono text-emerald-400">
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded">AI_OPTIC_LENS_v2.5</span>
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded">STATUS: READY</span>
            </div>

            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#22c55e] animate-bounce"></div>
            )}

            <div className="flex justify-between items-end text-[10px] font-mono text-emerald-400">
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded">FOCUS: AUTO</span>
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded">RES: 1080p</span>
            </div>
          </div>

          {/* Upload Button Overlay */}
          <label className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium cursor-pointer shadow-lg flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Preset Sample Selector for Instant Hackathon Demonstration */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select a Demo Problem Photo to Inspect:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_SCENARIOS.map((scenario, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedImage(scenario.imgUrl);
                  setNotes(scenario.note);
                }}
                className={`text-left p-2 rounded-xl text-xs border transition ${
                  selectedImage === scenario.imgUrl
                    ? 'bg-brand-950/60 border-brand-500/60 text-white font-medium'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="block truncate">{scenario.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Customer Notes */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Optional Notes for AI Vision:
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Smell of burnt wire, visible leaking drop, etc."
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:outline-none text-slate-200"
          />
        </div>

        {/* Progress Bar when scanning */}
        {scanning && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-emerald-400 font-mono">
              <span>ANALYZING IMAGE FEATURES...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteScan}
            disabled={scanning}
            className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-xs font-semibold text-white transition shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2"
          >
            <Scan className="w-4 h-4" />
            <span>{scanning ? 'Analyzing Photo...' : 'Scan & Diagnose'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
