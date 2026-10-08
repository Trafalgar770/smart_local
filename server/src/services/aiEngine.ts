import { ai, isGeminiReady } from '../config/gemini.js';
import {
  analyzeWithFallback,
  reassessWithFallback,
  AnalyzeResult,
  ReassessResult,
} from './fallbackEngine.js';
import { ServiceCategory } from '../schemas/index.js';

const SYSTEM_PROMPT = `
You are the AI Engine for "LocalHelp AI" (Smart Local Service), an intelligent roadside and home services diagnostic system operating in India.

YOUR MANDATE:
Analyze user-submitted problems (text, transcribed voice, or visual analysis) and deliver safe, accurate, structured service diagnostics.

INVARIANT SAFETY RULES:
1. DETECT DANGER IMMEDIATELY: If the problem mentions smoke, sparks, active fire, burning smells, exposed live wires, gas leak smells, structural instability, or vehicle stranded on a high-speed highway, set safety_hazard_detected: true. Provide immediate safety advice (e.g., "Step back from the vehicle", "Shut off main breaker").
2. DO NOT GIVE DIY REPAIR INSTRUCTIONS for high-risk domains (electrical mains, AC refrigerant, open plumbing mains, internal engine teardowns).
3. ABSOLUTE BAN ON CLEANING SERVICES: You must NEVER recommend "Cleaning" or "Cleaner" services under any circumstances.
4. QUALITATIVE CONFIDENCE ONLY: Use ONLY "HIGH", "MODERATE", or "LOW". Never output percentage scores.
5. NO CERTAINTY PROMISES: Use non-definitive phrasing ("Possible issue", "Likely service", "This may indicate").

CHECKLIST CREATION RULES:
1. Generate 3 to 5 simple, non-technical, physical checks the user can safely observe.
2. Every item must be framed as an observable status.
3. Items are strictly OPTIONAL.

THREE-VALUED EVALUATION RULES:
1. "CHECKED" -> User confirmed TRUE.
2. "UNCHECKED" -> NOT ANSWERED (UNKNOWN). DO NOT ASSUME NO.
3. "DONT_KNOW" -> User evaluated but is UNSURE.
`;

const ALLOWED_CATEGORIES: ServiceCategory[] = [
  'PLUMBER', 'ELECTRICIAN', 'PAINTER', 'LABOUR', 'FUEL_DELIVERY',
  'BIKE_MECHANIC', 'CAR_MECHANIC', 'PUNCTURE_REPAIR', 'BATTERY_JUMPSTART',
  'TOWING', 'CARPENTER', 'AC_REPAIR', 'WELDER', 'MASON', 'MOVERS',
  'APPLIANCE_REPAIR', 'OTHER_SERVICES'
];

export async function analyzeProblem(
  problemDescription: string,
  inputType: 'TEXT' | 'VOICE' | 'VISION' = 'TEXT',
  imageBufferBase64?: string | null
): Promise<AnalyzeResult> {
  if (!isGeminiReady() || !ai) {
    console.log('[AI Engine] Using deterministic fallback engine (Gemini not configured)');
    return analyzeWithFallback(problemDescription);
  }

  try {
    const prompt = `
${SYSTEM_PROMPT}

Analyze this problem intake:
User Input: "${problemDescription}"
Input Type: ${inputType}
${imageBufferBase64 ? 'An image was also attached for visual context.' : ''}

Available categories: [${ALLOWED_CATEGORIES.join(', ')}]

Respond strictly with valid JSON conforming to this schema (no extra text, no markdown backticks):
{
  "identified_issue": "string",
  "primary_category": "ONE_OF_ALLOWED_CATEGORIES",
  "alternative_categories": ["CATEGORY_1", "CATEGORY_2"],
  "confidence_level": "HIGH" | "MODERATE" | "LOW",
  "safety_hazard_detected": boolean,
  "safety_warning_text": "string if hazard detected else empty string",
  "checklist_schema": [
    {
      "id": "short_unique_id",
      "label": "Observable check description",
      "description": "Why checking this is useful"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Validate category
    let primaryCat = (parsed.primary_category || '').toUpperCase() as ServiceCategory;
    if (!ALLOWED_CATEGORIES.includes(primaryCat)) {
      primaryCat = 'OTHER_SERVICES';
    }

    const altCategories = (parsed.alternative_categories || [])
      .map((c: string) => c.toUpperCase() as ServiceCategory)
      .filter((c: ServiceCategory) => ALLOWED_CATEGORIES.includes(c) && c !== primaryCat);

    return {
      identified_issue: parsed.identified_issue || 'Service diagnostic required',
      primary_category: primaryCat,
      alternative_categories: altCategories,
      confidence_level: ['HIGH', 'MODERATE', 'LOW'].includes(parsed.confidence_level)
        ? parsed.confidence_level
        : 'MODERATE',
      safety_hazard_detected: Boolean(parsed.safety_hazard_detected),
      safety_warning_text: parsed.safety_warning_text || undefined,
      checklist_schema: (parsed.checklist_schema || []).map((item: any, idx: number) => ({
        id: item.id || `chk_${idx + 1}`,
        label: item.label || 'Physical verification check',
        description: item.description || '',
      })),
    };
  } catch (err) {
    console.warn('[AI Engine] Gemini analyze call failed, falling back to local rule engine:', err);
    return analyzeWithFallback(problemDescription);
  }
}

export async function reassessProblem(
  rawInput: string,
  initialCategory: ServiceCategory,
  responses: Record<string, 'CHECKED' | 'UNCHECKED' | 'DONT_KNOW'>
): Promise<ReassessResult> {
  if (!isGeminiReady() || !ai) {
    return reassessWithFallback(rawInput, initialCategory, responses);
  }

  try {
    const prompt = `
${SYSTEM_PROMPT}

Re-assess diagnostic state:
Original Problem: "${rawInput}"
Initial Category: ${initialCategory}

Checklist Responses Provided by User:
${JSON.stringify(responses, null, 2)}

RE-ASSESSMENT INVARIANTS:
1. Evaluated keys mapped to "UNCHECKED" MUST BE TREATED AS UNKNOWN / UNANSWERED. DO NOT treat "UNCHECKED" as "NO" or "FALSE".
2. Base your updated recommendation strictly on confirmed ("CHECKED") statements and explicit "DONT_KNOW" uncertainties.
3. If "check_fuel" is CHECKED (confirmed out of fuel), pivot primary recommendation to "FUEL_DELIVERY".

Allowed categories: [${ALLOWED_CATEGORIES.join(', ')}]

Respond strictly with valid JSON (no markdown backticks):
{
  "identified_issue": "string",
  "primary_category": "ONE_OF_ALLOWED_CATEGORIES",
  "alternative_categories": ["CATEGORY_1", "CATEGORY_2"],
  "confidence_level": "HIGH" | "MODERATE" | "LOW",
  "final_recommendation": "string",
  "safety_hazard_detected": boolean,
  "safety_warning_text": "string if hazard detected else empty string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);

    let primaryCat = (parsed.primary_category || '').toUpperCase() as ServiceCategory;
    if (!ALLOWED_CATEGORIES.includes(primaryCat)) {
      primaryCat = initialCategory;
    }

    return {
      identified_issue: parsed.identified_issue || 'Updated diagnosis based on physical observation checks',
      primary_category: primaryCat,
      alternative_categories: (parsed.alternative_categories || []).filter((c: any) =>
        ALLOWED_CATEGORIES.includes(c)
      ),
      confidence_level: ['HIGH', 'MODERATE', 'LOW'].includes(parsed.confidence_level)
        ? parsed.confidence_level
        : 'HIGH',
      final_recommendation: parsed.final_recommendation || `Proceeding with ${primaryCat} service.`,
      safety_hazard_detected: Boolean(parsed.safety_hazard_detected),
      safety_warning_text: parsed.safety_warning_text || undefined,
    };
  } catch (err) {
    console.warn('[AI Engine] Gemini reassess call failed, falling back to local rule engine:', err);
    return reassessWithFallback(rawInput, initialCategory, responses);
  }
}
