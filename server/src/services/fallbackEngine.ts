import { ServiceCategory } from '../schemas/index.js';

export interface ChecklistItemSchema {
  id: string;
  label: string;
  description: string;
}

export interface AnalyzeResult {
  identified_issue: string;
  primary_category: ServiceCategory;
  alternative_categories: ServiceCategory[];
  confidence_level: 'HIGH' | 'MODERATE' | 'LOW';
  safety_hazard_detected: boolean;
  safety_warning_text?: string;
  checklist_schema: ChecklistItemSchema[];
}

export interface ReassessResult {
  identified_issue: string;
  primary_category: ServiceCategory;
  alternative_categories: ServiceCategory[];
  confidence_level: 'HIGH' | 'MODERATE' | 'LOW';
  final_recommendation: string;
  safety_hazard_detected: boolean;
  safety_warning_text?: string;
}

const CATEGORY_RULES: Record<
  ServiceCategory,
  {
    keywords: string[];
    typicalIssue: string;
    checklist: ChecklistItemSchema[];
    alternatives: ServiceCategory[];
  }
> = {
  BIKE_MECHANIC: {
    keywords: ['bike', 'two wheeler', 'motorcycle', 'scooter', 'scooty', 'kick', 'clutch', 'gears', 'chain', 'bike start', 'activa', 'pulsar', 'splendor'],
    typicalIssue: 'Possible two-wheeler ignition, fuel supply, or battery discharge issue',
    checklist: [
      { id: 'check_fuel', label: 'Check fuel level in petrol tank', description: 'Confirm whether the fuel tank is empty or on reserve' },
      { id: 'check_battery_horn', label: 'Check if horn sounds strong or headlight illuminates', description: 'Tests whether electrical battery has adequate charge' },
      { id: 'check_engine_switch', label: 'Check engine kill switch position', description: 'Ensure red toggle switch on right handlebar is in RUN position' },
      { id: 'check_spark_plug', label: 'Inspect spark plug cap connection', description: 'Verify wire cap is tightly pressed onto the spark plug' },
    ],
    alternatives: ['FUEL_DELIVERY', 'BATTERY_JUMPSTART', 'PUNCTURE_REPAIR'],
  },
  CAR_MECHANIC: {
    keywords: ['car', 'four wheeler', 'sedan', 'suv', 'engine heating', 'radiator', 'brake', 'steering', 'clutch pedal', 'car won\'t start', 'dashboard warning'],
    typicalIssue: 'Possible automobile mechanical failure, cooling system fault, or transmission issue',
    checklist: [
      { id: 'check_fuel', label: 'Check car fuel gauge', description: 'Confirm if fuel needle is on Empty or low warning light is on' },
      { id: 'check_dash_lights', label: 'Observe dashboard warning cluster', description: 'Look for Check Engine, Oil Pressure, or Battery lights' },
      { id: 'check_fluid_puddle', label: 'Inspect ground underneath car for fluid puddles', description: 'Check for green/red coolant or dark oil spills beneath vehicle' },
      { id: 'check_crank_sound', label: 'Listen to engine crank response', description: 'Note if engine makes clicking sounds or cranks slowly without firing' },
    ],
    alternatives: ['TOWING', 'BATTERY_JUMPSTART', 'FUEL_DELIVERY'],
  },
  FUEL_DELIVERY: {
    keywords: ['out of fuel', 'petrol empty', 'diesel empty', 'jerry can', 'stranded without petrol', 'ran out of gas', 'fuel delivery'],
    typicalIssue: 'Vehicle stranded due to depleted fuel supply requiring emergency roadside fuel top-up',
    checklist: [
      { id: 'check_exact_fuel_type', label: 'Confirm vehicle fuel specification (Petrol vs Diesel)', description: 'Ensure correct fuel type is requested to prevent engine damage' },
      { id: 'check_safe_shoulder', label: 'Confirm vehicle is stationed off the active traffic lane', description: 'Ensure hazard flashers are on while awaiting fuel canister' },
    ],
    alternatives: ['TOWING', 'CAR_MECHANIC', 'BIKE_MECHANIC'],
  },
  BATTERY_JUMPSTART: {
    keywords: ['battery dead', 'jump start', 'clicking sound', 'lights dim', 'starter motor click', 'car battery flat', 'inverter battery dead'],
    typicalIssue: 'Low battery voltage or depleted starter battery preventing engine ignition',
    checklist: [
      { id: 'check_headlights', label: 'Turn on headlights to check brightness', description: 'Extremely dim headlights indicate depleted battery voltage' },
      { id: 'check_terminals', label: 'Inspect battery terminals for white corrosion or loose clamp', description: 'Look for crusty white build-up on battery posts' },
      { id: 'check_rapid_clicks', label: 'Note if starter produces rapid clicking noise', description: 'Rapid solenoid clicking is a characteristic symptom of low voltage' },
    ],
    alternatives: ['CAR_MECHANIC', 'BIKE_MECHANIC', 'TOWING'],
  },
  PUNCTURE_REPAIR: {
    keywords: ['puncture', 'flat tyre', 'flat tire', 'tyre air', 'tire pressure', 'nail in tyre', 'blown tyre', 'stepney'],
    typicalIssue: 'Punctured tube or tubeless tyre requiring plug patching or stepney wheel swap',
    checklist: [
      { id: 'check_nail_visible', label: 'Inspect tyre tread for visible nails or screws', description: 'Look along the rubber surface for embedded metal objects' },
      { id: 'check_spare_stepney', label: 'Verify spare stepney tyre is available in boot', description: 'Check if you have an inflated spare wheel and jack' },
      { id: 'check_sidewall_damage', label: 'Check if tyre sidewall has cracks or tears', description: 'Sidewall punctures cannot be patched and require tyre replacement' },
    ],
    alternatives: ['TOWING', 'CAR_MECHANIC', 'BIKE_MECHANIC'],
  },
  TOWING: {
    keywords: ['towing', 'tow truck', 'flatbed', 'accident', 'unmovable', 'stuck in ditch', 'transmission locked', 'wheel broken'],
    typicalIssue: 'Severe roadside vehicle breakdown requiring flatbed or wheel-lift towing to repair workshop',
    checklist: [
      { id: 'check_neutral_gear', label: 'Can vehicle transmission shift into Neutral (N)?', description: 'Neutral gear is required for rolling onto flatbed trailer' },
      { id: 'check_steering_unlocked', label: 'Is steering wheel unlocked?', description: 'Ensure key is in ignition to allow steering alignment' },
      { id: 'check_safe_hazard_lights', label: 'Turn on emergency hazard warning indicators', description: 'Alert surrounding traffic on highway or main road' },
    ],
    alternatives: ['CAR_MECHANIC', 'BIKE_MECHANIC'],
  },
  ELECTRICIAN: {
    keywords: ['spark', 'shock', 'short circuit', 'mcb', 'tripping', 'switchboard', 'burnt smell', 'fuse', 'inverter', 'wiring', 'socket', 'fan', 'light'],
    typicalIssue: 'Electrical circuit anomaly, breaker trip, or faulty switchgear requiring certified electrician',
    checklist: [
      { id: 'check_mcb_status', label: 'Check main distribution box MCB positions', description: 'Notice if any breaker switch has tripped downward to OFF position' },
      { id: 'check_burning_smell', label: 'Notice if burning plastic odor emanates from switchboard', description: 'Indicates overheated wiring insulation' },
      { id: 'check_neighbor_power', label: 'Check whether neighboring houses have electrical supply', description: 'Distinguishes internal fault from grid outage' },
      { id: 'check_unplug_appliances', label: 'Unplug recently connected high-wattage appliances', description: 'Removes potential overload causing circuit trip' },
    ],
    alternatives: ['APPLIANCE_REPAIR', 'OTHER_SERVICES'],
  },
  PLUMBER: {
    keywords: ['leak', 'pipe', 'tap', 'water dripping', 'drain', 'flush', 'toilet', 'sink', 'tank overflow', 'faucet', 'seepage', 'clogged pipe'],
    typicalIssue: 'Plumbing leak, faulty valve washer, or sanitary drainage blockage',
    checklist: [
      { id: 'check_main_valve', label: 'Locate and turn main overhead water control valve', description: 'Shutting the main stopcock stops immediate water damage' },
      { id: 'check_near_electrical', label: 'Verify water is NOT pooling near electrical outlets', description: 'Prevent shock hazard from water seepage' },
      { id: 'check_leak_origin', label: 'Identify if leak is from faucet joint, drain trap, or concealed wall pipe', description: 'Helps technician arrive with correct replacement gaskets' },
    ],
    alternatives: ['MASON', 'OTHER_SERVICES'],
  },
  AC_REPAIR: {
    keywords: ['ac', 'air conditioner', 'ac not cooling', 'gas leak ac', 'compressor', 'water leaking ac', 'split ac', 'inverter ac'],
    typicalIssue: 'Air conditioner cooling failure, refrigerant pressure drop, or blower fan malfunction',
    checklist: [
      { id: 'check_remote_mode', label: 'Verify AC remote is set to COOL mode (snowflake symbol) and below 24°C', description: 'Ensure mode is not accidentally switched to FAN or DRY' },
      { id: 'check_outdoor_fan', label: 'Check if outdoor compressor unit fan is spinning', description: 'Confirms compressor electrical relay activation' },
      { id: 'check_air_filter', label: 'Inspect indoor air mesh filter for heavy dust clogging', description: 'Severely choked filters block airflow and ice up coils' },
    ],
    alternatives: ['APPLIANCE_REPAIR', 'ELECTRICIAN'],
  },
  CARPENTER: {
    keywords: ['wood', 'door', 'lock', 'hinge', 'cupboard', 'drawer', 'furniture', 'almirah', 'latch', 'wooden frame'],
    typicalIssue: 'Wooden fixture alignment, damaged door hinge, or jammed cabinet mechanism',
    checklist: [
      { id: 'check_swollen_wood', label: 'Check if wooden frame is swollen due to humidity/monsoon', description: 'Common cause of door jamming against floor or jamb' },
      { id: 'check_loose_screws', label: 'Inspect metal hinge plates for loose or stripped screws', description: 'Determines whether simple tightening or bracket replacement is needed' },
    ],
    alternatives: ['WELDER', 'OTHER_SERVICES'],
  },
  WELDER: {
    keywords: ['welding', 'welder', 'iron gate', 'grill', 'metal railing', 'broken iron', 'steel fabrication', 'gate hinge broken'],
    typicalIssue: 'Structural metal break, detached gate hinge, or fractured safety railing requiring ARC/TIG welding',
    checklist: [
      { id: 'check_power_source', label: 'Verify working 15A/16A heavy power outlet near work area', description: 'Welding machines require high-amperage electrical connection' },
      { id: 'check_flammable_proximity', label: 'Ensure no curtains, paint cans, or dry foliage near repair spot', description: 'Hot welding sparks pose fire hazard' },
    ],
    alternatives: ['CARPENTER', 'LABOUR'],
  },
  PAINTER: {
    keywords: ['paint', 'whitewash', 'wall peeling', 'dampness paint', 'putty', 'primer', 'texture', 'enamel'],
    typicalIssue: 'Wall surface deterioration, peeling emulsion, or dampness patch requiring masonry primer and repainting',
    checklist: [
      { id: 'check_surface_dry', label: 'Check if wall patch is completely dry to touch', description: 'Painting over wet seepage causes immediate blister bubbling' },
      { id: 'check_materials_ready', label: 'Do you already have paint bucket and putty on site?', description: 'Informs whether painter needs to purchase supplies beforehand' },
    ],
    alternatives: ['MASON', 'LABOUR'],
  },
  MASON: {
    keywords: ['mason', 'brick', 'cement', 'plaster', 'tiles', 'broken tile', 'civil work', 'wall crack', 'grouting'],
    typicalIssue: 'Civil structure defect, broken floor tiles, or plaster spalling requiring mason craftsmanship',
    checklist: [
      { id: 'check_crack_depth', label: 'Check if crack is hairline plaster crack or deep structural fissure', description: 'Helps assess structural severity and material quantity' },
      { id: 'check_spare_tiles', label: 'Do you possess matching spare tiles from original flooring?', description: 'Matching tile patterns requires original stock' },
    ],
    alternatives: ['PLUMBER', 'LABOUR'],
  },
  MOVERS: {
    keywords: ['movers', 'shifting', 'packers', 'house shifting', 'tempo', 'truck goods', 'furniture moving'],
    typicalIssue: 'Residential or commercial goods relocation requiring logistics truck and loaders',
    checklist: [
      { id: 'check_lift_access', label: 'Confirm service elevator availability at pickup and destination', description: 'Stairs significantly alter packing crew requirements' },
      { id: 'check_parking_clearance', label: 'Verify commercial tempo/truck parking space in society', description: 'Ensures truck can load within reasonable walking distance' },
    ],
    alternatives: ['LABOUR', 'OTHER_SERVICES'],
  },
  LABOUR: {
    keywords: ['labour', 'helper', 'heavy lifting', 'material shifting', 'loading', 'unloading', 'malba', 'debris clearing'],
    typicalIssue: 'Manual physical lifting, loading/unloading, or construction debris clearing',
    checklist: [
      { id: 'check_weight_estimate', label: 'Are heavy objects over 40 kg requiring multiple personnel?', description: 'Determines number of helpers required' },
      { id: 'check_safety_gloves', label: 'Ensure clear unobstructed pathway free of sharp debris', description: 'Ensures safe transit of bulky goods' },
    ],
    alternatives: ['MOVERS', 'OTHER_SERVICES'],
  },
  APPLIANCE_REPAIR: {
    keywords: ['washing machine', 'fridge', 'refrigerator', 'microwave', 'geyser', 'water heater', 'tv', 'chimney', 'mixer'],
    typicalIssue: 'Household appliance electronic control or mechanical heating/motor breakdown',
    checklist: [
      { id: 'check_plug_socket', label: 'Test appliance on an alternate working 16A wall socket', description: 'Rules out burnt socket before servicing internal appliance motor' },
      { id: 'check_water_supply', label: 'Check if inlet water tap is open (for geyser/washing machine)', description: 'Dry-running protects heating elements and pump motors' },
    ],
    alternatives: ['ELECTRICIAN', 'AC_REPAIR'],
  },
  OTHER_SERVICES: {
    keywords: ['other', 'general', 'technician', 'fix', 'service', 'help'],
    typicalIssue: 'General on-demand technical assistance and local servicing',
    checklist: [
      { id: 'check_safe_env', label: 'Ensure repair area has adequate light and safe access', description: 'Allows technician to evaluate problem quickly' },
    ],
    alternatives: ['ELECTRICIAN', 'PLUMBER'],
  },
};

export function analyzeWithFallback(
  problemText: string,
  categoryHint?: string
): AnalyzeResult {
  const lower = problemText.toLowerCase();

  // 1. Safety Hazard Detection
  const dangerKeywords = [
    'spark', 'shock', 'fire', 'smoke', 'burning smell', 'burn smell',
    'gas leak', 'gas smell', 'exposed wire', 'live wire', 'brake failure',
    'highway middle', 'explosion', 'electrocution', 'collapsed'
  ];

  const hasDanger = dangerKeywords.some(kw => lower.includes(kw));
  let safetyWarning: string | undefined;

  if (hasDanger) {
    if (lower.includes('spark') || lower.includes('smoke') || lower.includes('burning') || lower.includes('wire')) {
      safetyWarning = 'IMMEDIATE SAFETY ADVISORY: Shut off your main electrical MCB breaker switchboard immediately. Do not touch exposed metal surfaces or switches.';
    } else if (lower.includes('gas')) {
      safetyWarning = 'IMMEDIATE SAFETY ADVISORY: Do not ignite matches or toggle electrical switches. Extinguish flames, shut gas regulator, open all windows, and step outdoors.';
    } else if (lower.includes('brake') || lower.includes('highway')) {
      safetyWarning = 'IMMEDIATE SAFETY ADVISORY: Turn on emergency hazard flashers immediately. Move all passengers behind the crash barrier off the roadway.';
    } else {
      safetyWarning = 'CRITICAL HAZARD DETECTED: Immediately step away from the risk area and disconnect power/ignition.';
    }
  }

  // 2. Score Categories
  let bestCategory: ServiceCategory = 'OTHER_SERVICES';
  let bestScore = -1;
  const scoredCategories: { category: ServiceCategory; score: number }[] = [];

  for (const [catKey, rule] of Object.entries(CATEGORY_RULES) as [ServiceCategory, typeof CATEGORY_RULES[ServiceCategory]][]) {
    let score = 0;
    if (categoryHint && categoryHint.toUpperCase() === catKey) {
      score += 20;
    }
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 5 ? 5 : 3;
      }
    }
    scoredCategories.push({ category: catKey, score });
    if (score > bestScore) {
      bestScore = score;
      bestCategory = catKey;
    }
  }

  if (bestScore <= 0) {
    bestCategory = 'OTHER_SERVICES';
  }

  const categoryRule = CATEGORY_RULES[bestCategory];
  const confidence: 'HIGH' | 'MODERATE' | 'LOW' =
    bestScore >= 8 ? 'HIGH' : bestScore >= 3 ? 'MODERATE' : 'LOW';

  return {
    identified_issue: categoryRule.typicalIssue,
    primary_category: bestCategory,
    alternative_categories: categoryRule.alternatives,
    confidence_level: confidence,
    safety_hazard_detected: hasDanger,
    safety_warning_text: safetyWarning,
    checklist_schema: categoryRule.checklist,
  };
}

export function reassessWithFallback(
  rawInput: string,
  initialCategory: ServiceCategory,
  responses: Record<string, 'CHECKED' | 'UNCHECKED' | 'DONT_KNOW'>
): ReassessResult {
  const lower = rawInput.toLowerCase();
  let updatedCategory = initialCategory;
  let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  let recommendation = `Recommended service: ${initialCategory}.`;

  // THREE-VALUED LOGIC INVARIANT:
  // "UNCHECKED" is UNKNOWN / UNANSWERED (NEVER treated as FALSE/NO)
  // "CHECKED" is CONFIRMED TRUE
  // "DONT_KNOW" is EXPLICIT UNCERTAINTY

  // Check fuel pivot rule: If check_fuel is confirmed CHECKED, pivot to FUEL_DELIVERY
  if (responses['check_fuel'] === 'CHECKED') {
    updatedCategory = 'FUEL_DELIVERY';
    confidence = 'HIGH';
    recommendation = 'User confirmed fuel tank is empty. Pivoted to Emergency Roadside Fuel Delivery.';
  } else if (responses['check_battery_horn'] === 'CHECKED' || responses['check_headlights'] === 'CHECKED') {
    if (initialCategory === 'BIKE_MECHANIC' || initialCategory === 'CAR_MECHANIC') {
      updatedCategory = 'BATTERY_JUMPSTART';
      confidence = 'HIGH';
      recommendation = 'User verified electrical power failure / starter discharge. Recommended Battery Jumpstart technician.';
    }
  } else if (responses['check_nail_visible'] === 'CHECKED') {
    updatedCategory = 'PUNCTURE_REPAIR';
    confidence = 'HIGH';
    recommendation = 'Puncture verified with nail/leak in tyre. Recommended On-Demand Puncture Repair.';
  }

  const checkedCount = Object.values(responses).filter(v => v === 'CHECKED').length;
  if (checkedCount >= 2) {
    confidence = 'HIGH';
  }

  const hasDanger = ['spark', 'shock', 'fire', 'smoke', 'gas'].some(kw => lower.includes(kw));

  return {
    identified_issue: `Evaluated diagnosis based on verified observations and user input for "${rawInput.slice(0, 50)}..."`,
    primary_category: updatedCategory,
    alternative_categories: CATEGORY_RULES[updatedCategory]?.alternatives || [],
    confidence_level: confidence,
    final_recommendation: recommendation,
    safety_hazard_detected: hasDanger,
    safety_warning_text: hasDanger
      ? 'Safety hazard alert: Maintain safe perimeter and exercise caution.'
      : undefined,
  };
}
