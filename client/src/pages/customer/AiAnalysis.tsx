import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  AIAnalysisResult,
  ReassessmentResult,
  ChecklistState
} from '../../types';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  MinusCircle,
  ArrowRight,
  RefreshCw,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const AiAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(
    (location.state as any)?.analysis || null
  );
  const [reassessment, setReassessment] = useState<ReassessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(!analysis);
  const [reassessing, setReassessing] = useState<boolean>(false);

  // Independent 4-state checklist dictionary: item.id -> ChecklistState
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, ChecklistState>>({});

  // Follow-up question answers
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!analysis && id) {
      api.getAiSession(id)
        .then(res => {
          setAnalysis(res.session);
          // Initialize checklist states
          const initial: Record<string, ChecklistState> = {};
          (res.session?.checklistItems || []).forEach(item => {
            initial[item.id] = item.responseState || 'unanswered';
          });
          setChecklistAnswers(initial);
        })
        .catch(err => {
          console.error('Failed to load session:', err);
        })
        .finally(() => setLoading(false));
    } else if (analysis) {
      const initial: Record<string, ChecklistState> = {};
      (analysis.checklistItems || []).forEach(item => {
        initial[item.id] = item.responseState || 'unanswered';
      });
      setChecklistAnswers(initial);
      setLoading(false);
    }
  }, [id]);

  // Handle setting individual state for a checklist item
  const handleStateChange = (itemId: string, state: ChecklistState) => {
    setChecklistAnswers(prev => ({
      ...prev,
      [itemId]: state,
    }));
  };

  // Reassess with AI
  const handleReassess = async () => {
    if (!analysis) return;
    try {
      setReassessing(true);
      const res = await api.reassessProblem(analysis.sessionId, checklistAnswers);
      setReassessment(res.reassessment);
      setAnalysis(res.session);
    } catch (err: any) {
      console.error('Reassessment failed:', err);
      alert('Failed to reassess: ' + err.message);
    } finally {
      setReassessing(false);
    }
  };

  // Count answered items
  const answeredCount = Object.values(checklistAnswers).filter(s => s !== 'unanswered').length;
  const totalItems = analysis?.checklistItems.length || 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-300 font-medium">Running AI Diagnostic Engine...</p>
        <p className="text-xs text-slate-500">Checking safety protocols and local service domains</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 glass-panel rounded-3xl text-center space-y-4 border border-slate-800">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Diagnostic Session Not Found</h3>
        <p className="text-xs text-slate-400">The requested AI diagnosis could not be retrieved.</p>
        <Link
          to="/customer/ai"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <span>Start New Problem Analysis</span>
        </Link>
      </div>
    );
  }

  const primaryService = reassessment?.serviceRecommendation || analysis.detectedService;
  const confidence = reassessment?.confidence || analysis.confidence;
  const estimatedMin = reassessment?.estimatedPriceMin || analysis.estimatedPriceMin;
  const estimatedMax = reassessment?.estimatedPriceMax || analysis.estimatedPriceMax;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/customer/ai" className="hover:text-white">AI Assistant</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-400 font-medium">Diagnostic Report & Checklist</span>
        </div>

        {/* Urgent Safety Alert Banner if caution or danger */}
        {(analysis.safetyLevel === 'danger' || analysis.safetyLevel === 'caution' || reassessment?.urgentSafetyAdvice) && (
          <div className={`p-4 sm:p-5 rounded-2xl border flex items-start space-x-3.5 shadow-xl ${
            analysis.safetyLevel === 'danger'
              ? 'bg-red-950/70 border-red-500/40 text-red-200'
              : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
          }`}>
            <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${
              analysis.safetyLevel === 'danger' ? 'text-red-400' : 'text-amber-400'
            }`} />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>{analysis.safetyLevel === 'danger' ? 'CRITICAL SAFETY WARNING' : 'CAUTION ADVISED'}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40">
                  {analysis.safetyLevel}
                </span>
              </h4>
              <p className="text-xs leading-relaxed">
                {reassessment?.urgentSafetyAdvice || analysis.safetyWarning}
              </p>
            </div>
          </div>
        )}

        {/* Diagnosis Header Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI Diagnosis Complete
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold ${
                  confidence === 'high'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : confidence === 'moderate'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {confidence} confidence
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
                <span>Recommended:</span>
                <span className="text-brand-400">{primaryService.name}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {analysis.problemSummary}
              </p>

              <p className="text-xs text-slate-400 italic">
                {analysis.initialTechnicalHypothesis}
              </p>
            </div>

            {/* Price & Primary CTA */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 min-w-[240px] text-center space-y-3 shadow-lg">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Typical Service Cost</p>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  ₹{estimatedMin} – ₹{estimatedMax}
                </p>
                <p className="text-[10px] text-slate-500">Standard visit & diagnosis in India</p>
              </div>

              {/* CRITICAL RULE: This button must ALWAYS remain enabled, even with 0/5 checklist items answered! */}
              <button
                onClick={() => navigate(`/customer/providers?serviceId=${primaryService.id}`)}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2"
                id="btn-find-nearby-providers"
              >
                <Compass className="w-4 h-4" />
                <span>Find Nearby Providers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SIGNATURE SECTION: BEFORE YOU CALL DYNAMIC OPTIONAL CHECKLIST     */}
        {/* ================================================================ */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              {/* Mandatory Heading */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                <span>🔎 Before You Call</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 font-normal">
                  Optional
                </span>
              </h3>
              {/* Mandatory Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                "Answer whatever you know. These quick checks may help the AI understand your problem better."
              </p>
            </div>

            {/* Checklist progress tracker (Never blocks proceeding!) */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 font-medium">
                Answered: <strong className="text-white">{answeredCount} / {totalItems}</strong>
              </span>
              <button
                onClick={handleReassess}
                disabled={reassessing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition"
                title="Update AI diagnostic based on current checks"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${reassessing ? 'animate-spin' : ''}`} />
                <span>{reassessing ? 'Reassessing...' : 'Reassess with AI'}</span>
              </button>
            </div>
          </div>

          {/* List of Checklist Items with independent 4-states */}
          <div className="space-y-3">
            {analysis.checklistItems.map((item, idx) => {
              const currentState = checklistAnswers[item.id] || 'unanswered';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentState === 'yes'
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : currentState === 'no'
                      ? 'bg-slate-900/60 border-slate-700'
                      : currentState === 'unknown'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-100 leading-snug">
                          {item.itemText}
                        </p>
                        {item.safetyLevel !== 'normal' && (
                          <span className={`inline-flex items-center space-x-1 text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                            item.safetyLevel === 'danger'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            <span>{item.safetyLevel} check</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Independent 4-State Buttons (Mandatory: UNANSWERED, YES, NO, UNKNOWN) */}
                    <div className="flex items-center space-x-1 sm:self-center shrink-0">
                      {/* YES */}
                      <button
                        type="button"
                        onClick={() => handleStateChange(item.id, currentState === 'yes' ? 'unanswered' : 'yes')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          currentState === 'yes'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Yes, confirmed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Yes</span>
                      </button>

                      {/* NO */}
                      <button
                        type="button"
                        onClick={() => handleStateChange(item.id, currentState === 'no' ? 'unanswered' : 'no')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          currentState === 'no'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="No, not the case"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>No</span>
                      </button>

                      {/* UNKNOWN ("I don't know") */}
                      <button
                        type="button"
                        onClick={() => handleStateChange(item.id, currentState === 'unknown' ? 'unanswered' : 'unknown')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          currentState === 'unknown'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="I don't know / cannot check"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Not Sure</span>
                      </button>

                      {/* Reset to UNANSWERED */}
                      {currentState !== 'unanswered' && (
                        <button
                          type="button"
                          onClick={() => handleStateChange(item.id, 'unanswered')}
                          className="p-1.5 text-slate-400 hover:text-slate-200"
                          title="Reset to unanswered"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reassessment Result Display */}
          {reassessment && (
            <div className="bg-brand-950/40 border border-brand-500/30 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Reassessment Applied</span>
                </span>
                <span className="text-slate-400 font-mono">
                  {reassessment.checklistSummary.yesCount} Yes • {reassessment.checklistSummary.noCount} No • {reassessment.checklistSummary.unansweredCount} Unanswered
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {reassessment.diagnosticSummary}
              </p>
            </div>
          )}

          {/* Checklist Footer Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>
              💡 <em>Rule: Leaving items unanswered will never assume "No". Answer only what is safe.</em>
            </p>
            <button
              onClick={() => navigate(`/customer/providers?serviceId=${primaryService.id}`)}
              className="text-brand-400 hover:text-brand-300 font-semibold underline flex items-center space-x-1"
            >
              <span>Skip remaining checks & proceed to providers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        {/* Alternative Services Card */}
        {analysis.alternativeServices.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Alternative Service Categories (In case problem is related)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.alternativeServices.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{alt.name}</h5>
                    <p className="text-[11px] text-slate-400">{alt.confidenceMatch}</p>
                  </div>
                  <Link
                    to={`/customer/providers?serviceId=${alt.id}`}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View Providers</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
