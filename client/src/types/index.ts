export type UserRole = 'customer' | 'provider' | 'admin';

export type ServiceCategory =
  | 'PLUMBER'
  | 'ELECTRICIAN'
  | 'PAINTER'
  | 'LABOUR'
  | 'FUEL_DELIVERY'
  | 'BIKE_MECHANIC'
  | 'CAR_MECHANIC'
  | 'PUNCTURE_REPAIR'
  | 'BATTERY_JUMPSTART'
  | 'TOWING'
  | 'CARPENTER'
  | 'AC_REPAIR'
  | 'WELDER'
  | 'MASON'
  | 'MOVERS'
  | 'APPLIANCE_REPAIR'
  | 'OTHER_SERVICES';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: UserRole;
  createdAt: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  typicalPriceMin: number;
  typicalPriceMax: number;
  unit: string;
  keywords: string[];
  safetyAdvice: string;
  defaultChecklist: {
    text: string;
    safetyLevel: 'normal' | 'caution' | 'danger';
  }[];
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  phone: string;
  avatarUrl: string;
  serviceArea: string;
  latitude: number;
  longitude: number;
  availabilityStatus: 'available' | 'busy' | 'offline';
  verified: boolean;
  averageRating: number;
  completedJobs: number;
  responseTimeMinutes: number;
  serviceIds: string[];
  basePrice: number;
  distanceKm?: number;
  estimatedArrivalMinutes?: number;
  rankingScore?: number;
  createdAt: string;
}

export type ChecklistState = 'unanswered' | 'yes' | 'no' | 'unknown';

export interface ChecklistItem {
  id: string;
  itemText: string;
  safetyLevel: 'normal' | 'caution' | 'danger';
  responseState: ChecklistState;
}

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
    answer?: string;
    answered?: boolean;
  }[];
  checklistItems: ChecklistItem[];
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

export type RequestStatus =
  | 'request_sent'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'service_started'
  | 'completed'
  | 'cancelled';

export interface LocationShare {
  id: string;
  requestId: string;
  customerId: string;
  providerId?: string;
  permissionStatus: 'not_shared' | 'permission_requested' | 'shared' | 'stopped' | 'expired';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  sharedAt?: string;
  stoppedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  providerId?: string;
  serviceId: string;
  aiSessionId?: string;
  problemDescription: string;
  aiSummary?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  customerLatitude?: number;
  customerLongitude?: number;
  customerAddress?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  service?: ServiceDefinition;
  provider?: ProviderProfile;
  customer?: UserProfile;
  locationShare?: LocationShare;
  messages?: ChatMessage[];
  review?: Review;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  customerId: string;
  customerName?: string;
  providerId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}
