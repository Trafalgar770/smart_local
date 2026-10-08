import React from 'react';
import {
  CheckSquare,
  Square,
  HelpCircle,
  SkipForward,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export type ChecklistValue = 'CHECKED' | 'UNCHECKED' | 'DONT_KNOW';

export interface ChecklistItemData {
  id: string;
  label: string;
  description?: string;
}

interface BeforeYouCallChecklistProps {
  items: ChecklistItemData[];
  responses: Record<string, ChecklistValue>;
  onResponseChange: (id: string, value: ChecklistValue) => void;
  onReassess: () => void;
  onSkip: () => void;
  isReassessing?: boolean;
}

export function BeforeYouCallChecklist({
  items,
  responses,
  onResponseChange,
  onReassess,
  onSkip,
  isReassessing = false,
}: BeforeYouCallChecklistProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const answeredCount = Object.values(responses).filter(v => v !== 'UNCHECKED').length;
  const checkedCount = Object.values(responses).filter(v => v === 'CHECKED').length;

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-700/70 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3 h-3" />
            100% Optional • Three-Valued Logic Safe
          </div>
          <h3 className="text-xl font-extrabold text-white">
            &ldquo;Before You Call&rdquo; Safe Physical Checks
          </h3>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">
            Observing these safe cues helps refine technician diagnosis and equipment selection. You can skip any or all items.
          </p>
        </div>

        {/* Progress pill */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {answeredCount} of {items.length} answered
          </span>
          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-300"
              style={{ width: `${(answeredCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {items.map(item => {
          const currentVal = responses[item.id] || 'UNCHECKED';
          const isChecked = currentVal === 'CHECKED';
          const isDontKnow = currentVal === 'DONT_KNOW';

          return (
            <div
              key={item.id}
              className={`rounded-xl p-4 transition-all border ${
                isChecked
                  ? 'bg-brand-950/20 border-brand-500/50'
                  : isDontKnow
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Primary toggle button */}
                  <button
                    type="button"
                    onClick={() =>
                      onResponseChange(item.id, isChecked ? 'UNCHECKED' : 'CHECKED')
                    }
                    className={`mt-0.5 p-1 rounded-md transition shrink-0 ${
                      isChecked
                        ? 'text-brand-400 bg-brand-500/20'
                        : 'text-slate-400 hover:text-white bg-slate-800'
                    }`}
                    title={isChecked ? 'Mark as Unchecked' : 'Confirm observed (True)'}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-brand-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <span
                      onClick={() =>
                        onResponseChange(item.id, isChecked ? 'UNCHECKED' : 'CHECKED')
                      }
                      className={`text-sm md:text-base font-semibold cursor-pointer select-none transition ${
                        isChecked ? 'text-brand-200' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* State selector action buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onResponseChange(item.id, isChecked ? 'UNCHECKED' : 'CHECKED')
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      isChecked
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-900/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isChecked ? 'Confirmed Yes' : 'Yes'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onResponseChange(item.id, isDontKnow ? 'UNCHECKED' : 'DONT_KNOW')
                    }
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      isDontKnow
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Mark as unsure"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Not Sure</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Logic Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
        <span>
          <strong>Three-Valued Logic Invariant:</strong> Unchecked items are treated as <em>UNKNOWN</em> (never assumed as False). Only confirm items you have safely inspected.
        </span>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          id="skip-checklist-btn"
          onClick={onSkip}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition"
        >
          <SkipForward className="w-4 h-4 text-slate-400" />
          <span>Skip Checklist & Match Providers</span>
        </button>

        <button
          type="button"
          id="reassess-checklist-btn"
          onClick={onReassess}
          disabled={isReassessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-900/40 disabled:opacity-50 transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isReassessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating AI Recommendation...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Update AI Recommendation ({checkedCount} Confirmed)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BeforeYouCallChecklist;
