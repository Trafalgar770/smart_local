import { GoogleGenAI } from '@google/genai';
import { ENV, isGeminiConfigured } from '../config/env.js';
import { SERVICES } from '../data/services.js';
import {
  analyzeWithFallback,
  reassessWithFallback,
  AIAnalysisResult,
  ReassessmentResult
} from './fallbackAi.js';

let genAIClient: GoogleGenAI | null = null;

if (isGeminiConfigured()) {
  try {
    genAIClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client, fallback will be used:', err);
  }
}

export async function analyzeProblemAI(
  problemDescription: string,
  categoryHint?: string
): Promise<AIAnalysisResult> {
  if (!genAIClient) {
    console.log('[AI] Using deterministic fallback engine (No Gemini API Key)');
    return analyzeWithFallback(problemDescription, categoryHint);
  }

  try {
    const validCategories = SERVICES.map(s => `"${s.name}" (slug: "${s.slug}")`).join(', ');

    const prompt = `
You are the AI diagnostic core for SMART LOCAL SERVICE, a roadside assistance and home technical service platform in India.
The customer submitted this problem:
"${problemDescription}"

Allowed services in the platform: [${validCategories}].
IMPORTANT: "Cleaning" or "Cleaner" is STRICTLY FORBIDDEN and DOES NOT EXIST in this platform.

Analyze the problem and respond ONLY with a raw valid JSON object (no markdown, no backticks, no code block) matching this exact structure:
{
  "detectedCategorySlug": "slug_of_best_match",
  "confidence": "high" | "moderate" | "low",
  "problemSummary": "1-2 sentence concise summary",
  "initialTechnicalHypothesis": "What is likely failing and why",
  "safetyLevel": "normal" | "caution" | "danger",
  "safetyWarning": "Immediate safety advisory if caution/danger, else null",
  "followUpQuestions": [
    {
      "questionText": "Clarifying question",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ],
  "checklistItems": [
    {
      "itemText": "Specific safe thing the customer can check BEFORE calling a professional (e.g., 'Is the valve turned off?')",
      "safetyLevel": "normal" | "caution" | "danger"
    }
  ],
  "estimatedPriceMin": 299,
  "estimatedPriceMax": 899
}
Provide exactly 4 or 5 checklist items that are safe, practical, and non-invasive.
`;

    const response = await genAIClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);

    const detectedService = SERVICES.find(s => s.slug === parsed.detectedCategorySlug) || SERVICES[0];
    const alternativeServices = SERVICES.filter(s => s.slug !== detectedService.slug).slice(0, 2).map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      confidenceMatch: 'Secondary service category match'
    }));

    const sessionId = `ai-sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      sessionId,
      detectedService: {
        id: detectedService.id,
        name: detectedService.name,
        slug: detectedService.slug,
        icon: detectedService.icon,
        typicalPriceMin: parsed.estimatedPriceMin || detectedService.typicalPriceMin,
        typicalPriceMax: parsed.estimatedPriceMax || detectedService.typicalPriceMax,
      },
      alternativeServices,
      confidence: parsed.confidence || 'moderate',
      problemSummary: parsed.problemSummary,
      initialTechnicalHypothesis: parsed.initialTechnicalHypothesis,
      safetyLevel: parsed.safetyLevel || 'normal',
      safetyWarning: parsed.safetyWarning || undefined,
      followUpQuestions: (parsed.followUpQuestions || []).map((q: any, i: number) => ({
        id: `fq-${Date.now()}-${i + 1}`,
        questionText: q.questionText,
        options: q.options || ['Yes', 'No', 'Not sure']
      })),
      checklistItems: (parsed.checklistItems || []).map((c: any, i: number) => ({
        id: `chk-${Date.now()}-${i + 1}`,
        itemText: c.itemText,
        safetyLevel: c.safetyLevel || 'normal',
        responseState: 'unanswered' as const,
      })),
      estimatedPriceMin: parsed.estimatedPriceMin || detectedService.typicalPriceMin,
      estimatedPriceMax: parsed.estimatedPriceMax || detectedService.typicalPriceMax,
    };
  } catch (err) {
    console.warn('[AI] Gemini call failed, falling back to deterministic local AI:', err);
    return analyzeWithFallback(problemDescription, categoryHint);
  }
}

export async function reassessProblemAI(
  originalAnalysis: AIAnalysisResult,
  checklistAnswers: Record<string, 'unanswered' | 'yes' | 'no' | 'unknown'>
): Promise<ReassessmentResult> {
  // Check fallback or Gemini
  return reassessWithFallback(originalAnalysis, checklistAnswers);
}
