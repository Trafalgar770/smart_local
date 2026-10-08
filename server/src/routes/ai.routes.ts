import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  AnalyzeRequestSchema,
  ReassessRequestSchema,
} from '../schemas/index.js';
import { analyzeProblem, reassessProblem } from '../services/aiEngine.js';
import { mockDb } from '../data/mockDb.js';

const router = Router();

// POST /api/ai/analyze
router.post('/analyze', validateBody(AnalyzeRequestSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problemDescription, inputType = 'TEXT', imageBufferBase64 } = req.body;
    const analysis = await analyzeProblem(problemDescription, inputType, imageBufferBase64);

    const sessionId = `ai-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Build structured object matching client AIAnalysisResult type
    const analysisPayload: any = {
      sessionId,
      detectedService: {
        id: (analysis.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        name: (analysis.primary_category || 'BIKE_MECHANIC').replace(/_/g, ' '),
        slug: (analysis.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        icon: 'Wrench',
        typicalPriceMin: 299,
        typicalPriceMax: 799,
      },
      alternativeServices: (analysis.alternative_categories || []).map((cat: string) => ({
        id: cat.toLowerCase().replace(/_/g, '-'),
        name: cat.replace(/_/g, ' '),
        slug: cat.toLowerCase().replace(/_/g, '-'),
        confidenceMatch: '75%',
      })),
      confidence: (analysis.confidence_level || 'MODERATE').toLowerCase() as any,
      problemSummary: analysis.identified_issue,
      initialTechnicalHypothesis: analysis.identified_issue,
      safetyLevel: analysis.safety_hazard_detected ? 'danger' : 'normal',
      safetyWarning: analysis.safety_warning_text,
      followUpQuestions: [],
      checklistItems: (analysis.checklist_schema || []).map((item: any, idx: number) => ({
        id: item.id || `chk_${idx + 1}`,
        itemText: item.label,
        safetyLevel: 'normal',
        responseState: 'unanswered',
      })),
      estimatedPriceMin: 299,
      estimatedPriceMax: 799,
    };

    // Store in mock/local session db for continuity
    mockDb.saveAiSession(analysisPayload as any);

    return res.json({
      success: true,
      sessionId,
      analysis: analysisPayload,
      session: analysisPayload,
      ...analysis,
      // Backwards compatibility aliases
      identified_issue: analysis.identified_issue,
      primary_category: analysis.primary_category,
      alternative_categories: analysis.alternative_categories,
      confidence_level: analysis.confidence_level,
      safety_hazard_detected: analysis.safety_hazard_detected,
      safety_warning_text: analysis.safety_warning_text,
      checklist_schema: analysis.checklist_schema,
    });
  } catch (error: any) {
    console.error('[AI Route] Analyze Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI problem intake',
    });
  }
});

// POST /api/ai/reassess
router.post('/reassess', validateBody(ReassessRequestSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { rawInput, initialCategory, responses, checklistAnswers, sessionId } = req.body;

    // Normalize responses if checklistAnswers passed from legacy caller
    if (!responses && checklistAnswers) {
      responses = {};
      for (const [key, val] of Object.entries(checklistAnswers)) {
        if (val === 'yes' || val === 'CHECKED') responses[key] = 'CHECKED';
        else if (val === 'unknown' || val === 'DONT_KNOW') responses[key] = 'DONT_KNOW';
        else responses[key] = 'UNCHECKED';
      }
    }

    if (!rawInput && sessionId) {
      const stored = mockDb.getAiSession(sessionId);
      if (stored) {
        rawInput = stored.problemSummary;
        initialCategory = initialCategory || stored.detectedService?.slug?.toUpperCase()?.replace(/-/g, '_') || 'BIKE_MECHANIC';
      }
    }

    rawInput = rawInput || 'Customer reported service issue';
    initialCategory = initialCategory || 'BIKE_MECHANIC';
    responses = responses || {};

    const reassessment = await reassessProblem(
      rawInput,
      initialCategory as any,
      responses as any
    );

    const reassessPayload = {
      sessionId: sessionId || `reassess-${Date.now()}`,
      serviceRecommendation: {
        id: (reassessment.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        name: (reassessment.primary_category || 'BIKE_MECHANIC').replace(/_/g, ' '),
        slug: (reassessment.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        icon: 'Wrench',
      },
      confidence: (reassessment.confidence_level || 'HIGH').toLowerCase() as any,
      diagnosticSummary: reassessment.final_recommendation || reassessment.identified_issue,
      recommendedAction: reassessment.final_recommendation,
      urgentSafetyAdvice: reassessment.safety_warning_text,
      estimatedPriceMin: 299,
      estimatedPriceMax: 899,
      checklistSummary: {
        total: Object.keys(responses).length,
        answered: Object.values(responses).filter((v: any) => v === 'CHECKED' || v === 'yes').length,
        yesCount: Object.values(responses).filter((v: any) => v === 'CHECKED' || v === 'yes').length,
        noCount: 0,
        unknownCount: Object.values(responses).filter((v: any) => v === 'DONT_KNOW' || v === 'unknown').length,
        unansweredCount: Object.values(responses).filter((v: any) => v === 'UNCHECKED' || v === 'unanswered').length,
      },
    };

    return res.json({
      success: true,
      sessionId: reassessPayload.sessionId,
      reassessment: reassessPayload,
      ...reassessment,
      identified_issue: reassessment.identified_issue,
      primary_category: reassessment.primary_category,
      alternative_categories: reassessment.alternative_categories,
      confidence_level: reassessment.confidence_level,
      final_recommendation: reassessment.final_recommendation,
      safety_hazard_detected: reassessment.safety_hazard_detected,
      safety_warning_text: reassessment.safety_warning_text,
    });
  } catch (error: any) {
    console.error('[AI Route] Reassess Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to reassess problem state',
    });
  }
});

// POST /api/ai/scan (Vision modal endpoint)
router.post('/scan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image, notes } = req.body;
    const description = notes
      ? `Visual problem scan inspection with user note: "${notes}". Visual anomaly detected on equipment.`
      : 'Visual inspection photo submitted: Detected wear, loose fitting, or fluid leak requiring diagnostic evaluation.';

    const analysis = await analyzeProblem(description, 'VISION', image);
    const sessionId = `ai-vis-${Date.now()}`;

    const analysisPayload: any = {
      sessionId,
      detectedService: {
        id: (analysis.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        name: (analysis.primary_category || 'BIKE_MECHANIC').replace(/_/g, ' '),
        slug: (analysis.primary_category || 'BIKE_MECHANIC').toLowerCase().replace(/_/g, '-'),
        icon: 'Wrench',
        typicalPriceMin: 299,
        typicalPriceMax: 799,
      },
      alternativeServices: (analysis.alternative_categories || []).map((cat: string) => ({
        id: cat.toLowerCase().replace(/_/g, '-'),
        name: cat.replace(/_/g, ' '),
        slug: cat.toLowerCase().replace(/_/g, '-'),
        confidenceMatch: '75%',
      })),
      confidence: (analysis.confidence_level || 'MODERATE').toLowerCase() as any,
      problemSummary: analysis.identified_issue,
      initialTechnicalHypothesis: analysis.identified_issue,
      safetyLevel: analysis.safety_hazard_detected ? 'danger' : 'normal',
      safetyWarning: analysis.safety_warning_text,
      followUpQuestions: [],
      checklistItems: (analysis.checklist_schema || []).map((item: any, idx: number) => ({
        id: item.id || `chk_${idx + 1}`,
        itemText: item.label,
        safetyLevel: 'normal',
        responseState: 'unanswered',
      })),
      estimatedPriceMin: 299,
      estimatedPriceMax: 799,
    };

    mockDb.saveAiSession(analysisPayload as any);

    return res.json({
      success: true,
      sessionId,
      visualDiagnosticNotes: 'Optical inspection completed. Geometric anomaly and technical pattern detected.',
      analysis: analysisPayload,
      session: analysisPayload,
      ...analysis,
    });
  } catch (error: any) {
    console.error('[AI Route] Scan Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process vision intake' });
  }
});

// GET /api/ai/session/:id
router.get('/session/:id', (req: AuthenticatedRequest, res: Response) => {
  const session = mockDb.getAiSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({ success: true, session });
});

// GET /api/ai/history
router.get('/history', (_req: AuthenticatedRequest, res: Response) => {
  const sessions = mockDb.getAllAiSessions();
  return res.json({ sessions });
});

export default router;
