import {
  UserProfile,
  ProviderProfile,
  ServiceDefinition,
  AIAnalysisResult,
  ReassessmentResult,
  ServiceRequest,
  LocationShare,
  ChatMessage,
  Review,
  ChecklistState,
  RequestStatus
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('sls_token');
  const demoUserId = localStorage.getItem('sls_demo_user_id');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (demoUserId) headers['x-demo-user-id'] = demoUserId;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: UserProfile | null; providerProfile: ProviderProfile | null }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async login(email: string): Promise<{ token: string; user: UserProfile; providerProfile: ProviderProfile | null }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    return handleResponse(res);
  },

  async register(data: any): Promise<{ token: string; user: UserProfile; providerProfile: ProviderProfile | null }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async demoSwitch(persona: 'customer' | 'provider-mechanic' | 'provider-electrician'): Promise<{
    token: string;
    user: UserProfile;
    providerProfile: ProviderProfile | null;
  }> {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona }),
    });
    return handleResponse(res);
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getAuthHeaders() });
    localStorage.removeItem('sls_token');
    localStorage.removeItem('sls_demo_user_id');
  },

  // Services (strictly no cleaning)
  async getServices(): Promise<{ services: ServiceDefinition[]; count: number }> {
    const res = await fetch(`${API_BASE}/services`);
    return handleResponse(res);
  },

  async getServiceById(id: string): Promise<{ service: ServiceDefinition }> {
    const res = await fetch(`${API_BASE}/services/${id}`);
    return handleResponse(res);
  },

  // Providers
  async getProviders(serviceId?: string): Promise<{ providers: ProviderProfile[]; count: number }> {
    const url = serviceId ? `${API_BASE}/providers?serviceId=${serviceId}` : `${API_BASE}/providers`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getNearbyProviders(params: {
    serviceId?: string;
    lat?: number;
    lng?: number;
    maxDistanceKm?: number;
    minRating?: number;
  }): Promise<{ providers: ProviderProfile[]; count: number; origin: any }> {
    const q = new URLSearchParams();
    if (params.serviceId) q.append('serviceId', params.serviceId);
    if (params.lat) q.append('lat', params.lat.toString());
    if (params.lng) q.append('lng', params.lng.toString());
    if (params.maxDistanceKm) q.append('maxDistanceKm', params.maxDistanceKm.toString());
    if (params.minRating) q.append('minRating', params.minRating.toString());

    const res = await fetch(`${API_BASE}/providers/nearby?${q.toString()}`);
    return handleResponse(res);
  },

  async getProviderById(id: string): Promise<{
    provider: ProviderProfile;
    reviews: Review[];
    offeredServices: ServiceDefinition[];
  }> {
    const res = await fetch(`${API_BASE}/providers/${id}`);
    return handleResponse(res);
  },

  async updateProviderStatus(status: 'available' | 'busy' | 'offline'): Promise<{ success: boolean; provider: ProviderProfile }> {
    const res = await fetch(`${API_BASE}/providers/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // AI
  async analyzeProblem(problemDescription: string, categoryHint?: string): Promise<{
    success: boolean;
    analysis: AIAnalysisResult;
  }> {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemDescription, categoryHint }),
    });
    return handleResponse(res);
  },

  async submitFollowUp(sessionId: string, questionId: string, answer: string): Promise<{ success: boolean; session: AIAnalysisResult }> {
    const res = await fetch(`${API_BASE}/ai/follow-up`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId, questionId, answer }),
    });
    return handleResponse(res);
  },

  async reassessProblem(sessionId: string, checklistAnswers: Record<string, ChecklistState>): Promise<{
    success: boolean;
    reassessment: ReassessmentResult;
    session: AIAnalysisResult;
  }> {
    const res = await fetch(`${API_BASE}/ai/reassess`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId, checklistAnswers }),
    });
    return handleResponse(res);
  },

  async scanProblem(image: string, notes?: string): Promise<{
    success: boolean;
    analysis: AIAnalysisResult;
    visualDiagnosticNotes: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/scan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image, notes }),
    });
    return handleResponse(res);
  },

  async getAiHistory(): Promise<{ sessions: AIAnalysisResult[] }> {
    const res = await fetch(`${API_BASE}/ai/history`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAiSession(id: string): Promise<{ session: AIAnalysisResult }> {
    const res = await fetch(`${API_BASE}/ai/session/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // Requests
  async createRequest(data: {
    serviceId: string;
    problemDescription: string;
    providerId?: string;
    aiSessionId?: string;
    aiSummary?: string;
    estimatedMin?: number;
    estimatedMax?: number;
    customerLatitude?: number;
    customerLongitude?: number;
    customerAddress?: string;
  }): Promise<{ success: boolean; request: ServiceRequest; message: string }> {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getRequests(): Promise<{ requests: ServiceRequest[]; count: number }> {
    const res = await fetch(`${API_BASE}/requests`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getRequestById(id: string): Promise<{ request: ServiceRequest }> {
    const res = await fetch(`${API_BASE}/requests/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateRequestStatus(id: string, status: RequestStatus, note?: string): Promise<{
    success: boolean;
    request: ServiceRequest;
    message: string;
    locationSharingActive: boolean;
  }> {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(res);
  },

  async cancelRequest(id: string): Promise<{ success: boolean; request: ServiceRequest; message: string }> {
    const res = await fetch(`${API_BASE}/requests/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Location
  async updateLocationPermission(
    requestId: string,
    permissionStatus: 'shared' | 'not_shared' | 'stopped',
    coords?: { latitude?: number; longitude?: number; accuracy?: number; address?: string }
  ): Promise<{ success: boolean; locationShare: LocationShare; message: string }> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/location/permission`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissionStatus, ...coords }),
    });
    return handleResponse(res);
  },

  async updateLocationCoordinates(requestId: string, coords: { latitude: number; longitude: number; accuracy?: number }): Promise<{
    success: boolean;
  }> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/location/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(coords),
    });
    return handleResponse(res);
  },

  async getLocationStatus(requestId: string): Promise<{ locationShare: LocationShare; updates: any[] }> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/location/status`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // Messages
  async getMessages(requestId: string): Promise<{ messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/messages/${requestId}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async sendMessage(data: { requestId: string; receiverId: string; message: string }): Promise<{
    success: boolean;
    message: ChatMessage;
  }> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Reviews
  async submitReview(data: {
    requestId: string;
    providerId: string;
    rating: number;
    reviewText?: string;
  }): Promise<{ success: boolean; review: Review; message: string }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getProviderReviews(providerId: string): Promise<{ reviews: Review[]; count: number }> {
    const res = await fetch(`${API_BASE}/reviews/provider/${providerId}`);
    return handleResponse(res);
  },

  // Master Prompt Specific API Endpoints
  async getProvidersMatch(params: { category?: string; lat?: number; lng?: number }): Promise<{
    success: boolean;
    providers: any[];
    count: number;
    matchedCategory: string;
  }> {
    const q = new URLSearchParams();
    if (params.category) q.append('category', params.category);
    if (params.lat) q.append('lat', params.lat.toString());
    if (params.lng) q.append('lng', params.lng.toString());
    const res = await fetch(`${API_BASE}/providers/match?${q.toString()}`);
    return handleResponse(res);
  },

  async updateLocationConsent(
    requestId: string,
    approved: boolean,
    coords?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<{ success: boolean; request: any; location_sharing_approved: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/location-consent`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved, ...coords }),
    });
    return handleResponse(res);
  },

  async getTracking(requestId: string): Promise<{ success: boolean; tracking: any }> {
    const res = await fetch(`${API_BASE}/tracking/${requestId}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async simulateTrackingStep(requestId: string): Promise<{ success: boolean; tracking: any }> {
    const res = await fetch(`${API_BASE}/tracking/simulate-step`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestId }),
    });
    return handleResponse(res);
  },
};
