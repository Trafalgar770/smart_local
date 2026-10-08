import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DiagnosticPanel } from '../components/DiagnosticPanel';
import { BeforeYouCallChecklist, ChecklistValue, ChecklistItemData } from '../components/BeforeYouCallChecklist';
import { SafetyBanner } from '../components/SafetyBanner';
import { Sparkles, ArrowLeft, RefreshCw, AlertCircle, Share2, Check, Copy } from 'lucide-react';

export function AnalyzePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Support both router state and direct URL search parameters
  const initialData = (location.state as any) || {};
  const urlProblem = searchParams.get('problem') || searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';

  const [rawProblem, setRawProblem] = useState<string>(
    initialData.problemDescription || initialData.rawInput || urlProblem || "My motorcycle stopped suddenly and won't turn on"
  );
  const [identifiedIssue, setIdentifiedIssue] = useState<string>(
    initialData.identified_issue || 'Preliminary mechanical/electrical analysis in progress'
  );
  const [primaryCategory, setPrimaryCategory] = useState<string>(
    initialData.primary_category || initialData.category || urlCategory || 'BIKE_MECHANIC'
  );
  const [alternativeCategories, setAlternativeCategories] = useState<string[]>(
    initialData.alternative_categories || ['FUEL_DELIVERY', 'BATTERY_JUMPSTART']
  );
  const [confidenceLevel, setConfidenceLevel] = useState<'HIGH' | 'MODERATE' | 'LOW'>(
    initialData.confidence_level || 'MODERATE'
  );
  const [safetyHazardDetected, setSafetyHazardDetected] = useState<boolean>(
    Boolean(initialData.safety_hazard_detected)
  );
  const [safetyWarningText, setSafetyWarningText] = useState<string | undefined>(
    initialData.safety_warning_text
  );
  const [checklistSchema, setChecklistSchema] = useState<ChecklistItemData[]>(
    initialData.checklist_schema || [
      { id: 'check_fuel', label: 'Check fuel level in tank', description: 'Confirm whether the fuel tank is empty or on reserve' },
      { id: 'check_battery_horn', label: 'Check if horn or headlight works', description: 'Tests whether electrical battery has adequate charge' },
      { id: 'check_engine_switch', label: 'Check engine kill switch toggle', description: 'Ensure switch is toggled to RUN position' },
    ]
  );

  const [checklistResponses, setChecklistResponses] = useState<Record<string, ChecklistValue>>({});
  const [isReassessing, setIsReassessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Synchronize URL query parameters so sharing and page refresh works seamlessly
  useEffect(() => {
    const currentParam = searchParams.get('problem');
    if (rawProblem && currentParam !== rawProblem) {
      setSearchParams(
        { problem: rawProblem, category: primaryCategory },
        { replace: true }
      );
    }
  }, [rawProblem, primaryCategory, setSearchParams]);

  // Trigger analysis if user arrived directly via URL or without precomputed analysis
  useEffect(() => {
    const problemToAnalyze = initialData.problemDescription || urlProblem;
    if (problemToAnalyze && !initialData.identified_issue) {
      setIsLoading(true);
      fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: problemToAnalyze,
          inputType: initialData.inputType || 'TEXT',
          imageBufferBase64: initialData.imageBufferBase64,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.identified_issue) {
            setIdentifiedIssue(data.identified_issue);
            setPrimaryCategory(data.primary_category);
            setAlternativeCategories(data.alternative_categories || []);
            setConfidenceLevel(data.confidence_level || 'MODERATE');
            setSafetyHazardDetected(Boolean(data.safety_hazard_detected));
            setSafetyWarningText(data.safety_warning_text);
            if (data.checklist_schema && data.checklist_schema.length > 0) {
              setChecklistSchema(data.checklist_schema);
            }
          }
        })
        .catch(err => console.error('Initial analysis failed:', err))
        .finally(() => setIsLoading(false));
    }
  }, [urlProblem]);

  const handleResponseChange = (itemId: string, value: ChecklistValue) => {
    setChecklistResponses(prev => ({ ...prev, [itemId]: value }));
  };

  const handleReassess = async () => {
    try {
      setIsReassessing(true);
      const res = await fetch('/api/ai/reassess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawProblem,
          initialCategory: primaryCategory,
          responses: checklistResponses,
        }),
      });
      const data = await res.json();
      if (data.primary_category) {
        setPrimaryCategory(data.primary_category);
        setConfidenceLevel(data.confidence_level || 'HIGH');
        setIdentifiedIssue(data.final_recommendation || data.identified_issue);
        if (data.safety_hazard_detected !== undefined) {
          setSafetyHazardDetected(data.safety_hazard_detected);
          setSafetyWarningText(data.safety_warning_text);
        }
      }
    } catch (err) {
      console.error('Reassess failed:', err);
    } finally {
      setIsReassessing(false);
    }
  };

  const handleSkipOrProceed = () => {
    navigate(`/providers?category=${encodeURIComponent(primaryCategory)}`, {
      state: {
        category: primaryCategory,
        problemSummary: identifiedIssue,
        confidenceLevel,
      },
    });
  };

  const handleCopyShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/analyze?problem=${encodeURIComponent(rawProblem)}&category=${encodeURIComponent(primaryCategory)}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Safety Override Banner */}
      {safetyHazardDetected && (
        <SafetyBanner hazardText={safetyWarningText} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Navigation back and Share Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intake Search</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Copy link to this diagnosis report"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Diagnosis Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Share Analysis</span>
                </>
              )}
            </button>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              Input: &ldquo;{rawProblem.slice(0, 28)}...&rdquo;
            </span>
          </div>
        </div>

        {/* Diagnostic Panel */}
        <DiagnosticPanel
          identifiedIssue={identifiedIssue}
          primaryCategory={primaryCategory}
          alternativeCategories={alternativeCategories}
          confidenceLevel={confidenceLevel}
          safetyHazardDetected={safetyHazardDetected}
          safetyWarningText={safetyWarningText}
          onProceedToMatching={handleSkipOrProceed}
          proceedLabel="Match Verified Providers"
        />

        {/* Optional Before You Call Dynamic Checklist */}
        <BeforeYouCallChecklist
          items={checklistSchema}
          responses={checklistResponses}
          onResponseChange={handleResponseChange}
          onReassess={handleReassess}
          onSkip={handleSkipOrProceed}
          isReassessing={isReassessing}
        />
      </div>
    </div>
  );
}

export default AnalyzePage;
