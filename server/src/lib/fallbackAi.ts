import { SERVICES, ServiceDefinition } from '../data/services.js';

export interface AIAnalysisResult {
  sessionId: string;
  detectedService: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    typicalPriceMin: number;
    typicalPriceMax: number;
  };
  alternativeServices: {
    id: string;
    name: string;
    slug: string;
    confidenceMatch: string;
  }[];
  confidence: 'high' | 'moderate' | 'low';
  problemSummary: string;
  initialTechnicalHypothesis: string;
  safetyLevel: 'normal' | 'caution' | 'danger';
  safetyWarning?: string;
  followUpQuestions: {
    id: string;
    questionText: string;
    options: string[];
  }[];
  checklistItems: {
    id: string;
    itemText: string;
    safetyLevel: 'normal' | 'caution' | 'danger';
    responseState: 'unanswered' | 'yes' | 'no' | 'unknown';
  }[];
  estimatedPriceMin: number;
  estimatedPriceMax: number;
}

export interface ReassessmentResult {
  sessionId: string;
  serviceRecommendation: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  confidence: 'high' | 'moderate' | 'low';
  diagnosticSummary: string;
  recommendedAction: string;
  urgentSafetyAdvice?: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  checklistSummary: {
    total: number;
    answered: number;
    yesCount: number;
    noCount: number;
    unknownCount: number;
    unansweredCount: number;
  };
}

export function analyzeWithFallback(
  problemText: string,
  categoryHint?: string
): AIAnalysisResult {
  const lower = problemText.toLowerCase();

  // 1. Scoring each service category
  const scoredServices = SERVICES.map(srv => {
    let score = 0;
    if (categoryHint && (srv.slug === categoryHint.toLowerCase() || srv.name.toLowerCase() === categoryHint.toLowerCase())) {
      score += 15;
    }
    for (const kw of srv.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 4 : 2;
      }
    }
    return { service: srv, score };
  });

  scoredServices.sort((a, b) => b.score - a.score);

  const matched = scoredServices[0]?.score > 0 ? scoredServices[0].service : SERVICES[0]; // fallback to plumber or first
  const secondMatch = scoredServices[1]?.score > 0 ? scoredServices[1].service : (matched.slug === 'car-mechanic' ? SERVICES.find(s => s.slug === 'towing')! : SERVICES[1]);
  const thirdMatch = scoredServices[2]?.score > 0 ? scoredServices[2].service : (matched.slug === 'bike-mechanic' ? SERVICES.find(s => s.slug === 'puncture-repair')! : SERVICES[2]);

  // 2. Safety Detection
  let safetyLevel: 'normal' | 'caution' | 'danger' = 'normal';
  let safetyWarning: string | undefined = undefined;

  const dangerKeywords = ['spark', 'shock', 'fire', 'smoke', 'burning smell', 'gas leak', 'steam', 'brake failure', 'highway middle', 'explosion', 'electrocution'];
  const cautionKeywords = ['overheating', 'water leak', 'flat tyre', 'cracked', 'jammed', 'highway shoulder', 'smell', 'tripping'];

  if (dangerKeywords.some(kw => lower.includes(kw))) {
    safetyLevel = 'danger';
    safetyWarning = 'CRITICAL SAFETY HAZARD DETECTED: Immediately disconnect the power/ignition and step to a safe distance before inspecting further.';
  } else if (cautionKeywords.some(kw => lower.includes(kw))) {
    safetyLevel = 'caution';
    safetyWarning = 'EXERCISE CAUTION: Please avoid aggressive DIY force and do not touch pressurized or damp exposed wiring.';
  }

  // 3. Confidence classification
  let confidence: 'high' | 'moderate' | 'low' = 'moderate';
  if (scoredServices[0].score >= 8) {
    confidence = 'high';
  } else if (scoredServices[0].score <= 2) {
    confidence = 'low';
  }

  // 4. Generate checklist items specific to problem and service
  const checklistItems = matched.defaultChecklist.map((item, index) => ({
    id: `chk-${Date.now()}-${index + 1}`,
    itemText: item.text,
    safetyLevel: item.safetyLevel,
    responseState: 'unanswered' as const,
  }));

  // 5. Follow up questions
  const followUpQuestions = [
    {
      id: `fq-${Date.now()}-1`,
      questionText: `Is the problem ongoing right now or did it occur earlier?`,
      options: ['Happening right now (Active)', 'Happened earlier / intermittent', 'Not sure'],
    },
    {
      id: `fq-${Date.now()}-2`,
      questionText: `Where is the service needed?`,
      options: ['Home / Residential Flat', 'On the Road / Highway', 'Commercial / Office'],
    }
  ];

  const sessionId = `ai-sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    sessionId,
    detectedService: {
      id: matched.id,
      name: matched.name,
      slug: matched.slug,
      icon: matched.icon,
      typicalPriceMin: matched.typicalPriceMin,
      typicalPriceMax: matched.typicalPriceMax,
    },
    alternativeServices: [
      {
        id: secondMatch.id,
        name: secondMatch.name,
        slug: secondMatch.slug,
        confidenceMatch: 'Secondary match based on problem context',
      },
      {
        id: thirdMatch.id,
        name: thirdMatch.name,
        slug: thirdMatch.slug,
        confidenceMatch: 'Possible alternative service provider',
      }
    ],
    confidence,
    problemSummary: `AI diagnosed customer query: "${problemText.slice(0, 100)}${problemText.length > 100 ? '...' : ''}". Likely category: ${matched.name}.`,
    initialTechnicalHypothesis: `Based on your description, the primary root cause appears linked to ${matched.name.toLowerCase()} domain systems. Further checks will confirm exact replacement or repair requirements.`,
    safetyLevel,
    safetyWarning,
    followUpQuestions,
    checklistItems,
    estimatedPriceMin: matched.typicalPriceMin,
    estimatedPriceMax: matched.typicalPriceMax,
  };
}

export function reassessWithFallback(
  originalAnalysis: AIAnalysisResult,
  checklistAnswers: Record<string, 'unanswered' | 'yes' | 'no' | 'unknown'>
): ReassessmentResult {
  const items = originalAnalysis.checklistItems;
  let yesCount = 0;
  let noCount = 0;
  let unknownCount = 0;
  let unansweredCount = 0;
  let hasCriticalYes = false;

  items.forEach(item => {
    const ans = checklistAnswers[item.id] || 'unanswered';
    if (ans === 'yes') {
      yesCount++;
      if (item.safetyLevel === 'danger' || item.safetyLevel === 'caution') {
        hasCriticalYes = true;
      }
    } else if (ans === 'no') {
      noCount++;
    } else if (ans === 'unknown') {
      unknownCount++;
    } else {
      unansweredCount++;
    }
  });

  const answeredCount = yesCount + noCount + unknownCount;

  // Confidence adjustments
  let confidence = originalAnalysis.confidence;
  if (answeredCount >= 3) {
    confidence = 'high';
  } else if (answeredCount === 0) {
    // Kept as-is, never broken!
    confidence = originalAnalysis.confidence;
  }

  let urgentSafetyAdvice: string | undefined = undefined;
  if (hasCriticalYes) {
    urgentSafetyAdvice = 'CRITICAL ADVISORY: One or more confirmed checklist points indicate immediate safety exposure. Please refrain from personal intervention and wait for the certified technician.';
  }

  // Adjust price estimate slightly based on affirmative conditions
  const priceMultiplier = hasCriticalYes ? 1.25 : (yesCount > 2 ? 1.15 : 1.0);
  const minPrice = Math.round(originalAnalysis.estimatedPriceMin * priceMultiplier);
  const maxPrice = Math.round(originalAnalysis.estimatedPriceMax * priceMultiplier);

  const diagnosticSummary = answeredCount > 0
    ? `Reassessed with ${answeredCount} verified checklist input(s). Customer confirmed ${yesCount} active condition(s) and excluded ${noCount}. Unanswered checks were respectfully treated as uninspected without assumptions.`
    : `Direct assessment without checklist constraints. Recommended ${originalAnalysis.detectedService.name} for immediate on-site professional diagnosis.`;

  return {
    sessionId: originalAnalysis.sessionId,
    serviceRecommendation: {
      id: originalAnalysis.detectedService.id,
      name: originalAnalysis.detectedService.name,
      slug: originalAnalysis.detectedService.slug,
      icon: originalAnalysis.detectedService.icon,
    },
    confidence,
    diagnosticSummary,
    recommendedAction: `Connect with a verified nearby ${originalAnalysis.detectedService.name} with standard diagnostic gear and parts.`,
    urgentSafetyAdvice,
    estimatedPriceMin: minPrice,
    estimatedPriceMax: maxPrice,
    checklistSummary: {
      total: items.length,
      answered: answeredCount,
      yesCount,
      noCount,
      unknownCount,
      unansweredCount,
    },
  };
}
