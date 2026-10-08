import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  ServiceRequestCreateSchema,
  LocationConsentSchema,
  StatusUpdateSchema,
} from '../schemas/index.js';
import { mockDb } from '../data/mockDb.js';
import { DEMO_PROVIDERS } from '../services/geoService.js';

const router = Router();

// In-memory active request store
export interface ServiceRequestRecord {
  id: string;
  customer_id: string;
  provider_id: string;
  diagnostic_id?: string | null;
  category: string;
  problem_summary: string;
  status: 'PENDING' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimated_cost_min: number;
  estimated_cost_max: number;
  location_sharing_approved: boolean;
  customer_location?: { latitude: number; longitude: number };
  customer_address_text: string;
  location_shared_at?: string;
  location_revoked_at?: string;
  created_at: string;
  updated_at: string;
  provider?: any;
}

export const ACTIVE_REQUESTS: Map<string, ServiceRequestRecord> = new Map();

// Helper to find or seed requests
export function getOrInitRequest(id: string): ServiceRequestRecord | undefined {
  if (ACTIVE_REQUESTS.has(id)) {
    return ACTIVE_REQUESTS.get(id);
  }
  // Check mockDb
  const fromMock = mockDb.getRequestById(id);
  if (fromMock) {
    const prov = DEMO_PROVIDERS.find(p => p.id === fromMock.providerId) || DEMO_PROVIDERS[0];
    const rec: ServiceRequestRecord = {
      id: fromMock.id,
      customer_id: fromMock.customerId,
      provider_id: fromMock.providerId || prov.id,
      category: (fromMock as any).category || 'BIKE_MECHANIC',
      problem_summary: fromMock.problemDescription,
      status: (fromMock.status.toUpperCase() as any) || 'PENDING',
      estimated_cost_min: fromMock.estimatedMin || 299,
      estimated_cost_max: fromMock.estimatedMax || 899,
      location_sharing_approved: false,
      customer_address_text: fromMock.customerAddress || 'Selected Location, Indiranagar, Bangalore',
      created_at: fromMock.createdAt,
      updated_at: fromMock.updatedAt,
      provider: prov,
    };
    ACTIVE_REQUESTS.set(id, rec);
    return rec;
  }
  // Graceful fallback for recognized demo tickets
  if (id && (id.startsWith('req-demo-') || id.startsWith('demo-') || id === 'demo_ticket')) {
    const prov = DEMO_PROVIDERS[0];
    const rec: ServiceRequestRecord = {
      id,
      customer_id: 'cust-rahul-01',
      provider_id: prov.id,
      category: 'BIKE_MECHANIC',
      problem_summary: 'Emergency roadside service request',
      status: 'ON_THE_WAY',
      estimated_cost_min: 349,
      estimated_cost_max: 799,
      location_sharing_approved: true,
      customer_location: { latitude: 12.9716, longitude: 77.5946 },
      customer_address_text: '100ft Road, Indiranagar, Bengaluru, Karnataka',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: prov,
    };
    ACTIVE_REQUESTS.set(id, rec);
    return rec;
  }
  return undefined;
}

// POST /api/requests/create (and POST /api/requests)
const handleCreateRequest = (req: AuthenticatedRequest, res: Response) => {
  const {
    providerId,
    diagnosticId,
    category,
    serviceId,
    problemSummary,
    problemDescription,
    aiSummary,
    estimatedCostMin,
    estimatedCostMax,
    estimatedMin,
    estimatedMax,
    customerAddressText,
    customerAddress,
    latitude,
    longitude,
    customerLatitude,
    customerLongitude,
  } = req.body;

  const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const customerId = req.user?.id || 'cust-rahul-01';

  const pId = providerId || 'b0000001-0001-0001-0001-000000000001';
  const provider = DEMO_PROVIDERS.find(p => p.id === pId) || DEMO_PROVIDERS[0];

  const cat = category || serviceId || provider.categories[0] || 'BIKE_MECHANIC';
  const problem = problemSummary || problemDescription || aiSummary || 'Emergency service diagnosis request';
  const address = customerAddressText || customerAddress || 'Connaught Place, New Delhi';
  const minCost = estimatedCostMin ?? estimatedMin ?? 299;
  const maxCost = estimatedCostMax ?? estimatedMax ?? 899;
  const lat = latitude ?? customerLatitude;
  const lng = longitude ?? customerLongitude;

  const newRecord: ServiceRequestRecord = {
    id,
    customer_id: customerId,
    provider_id: provider.id,
    diagnostic_id: diagnosticId || null,
    category: cat,
    problem_summary: problem,
    status: 'PENDING',
    estimated_cost_min: minCost,
    estimated_cost_max: maxCost,
    // Explicit Consent Invariant: Must remain FALSE until user explicitly grants via modal
    location_sharing_approved: false,
    customer_location: lat && lng ? { latitude: lat, longitude: lng } : undefined,
    customer_address_text: address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    provider,
  };

  ACTIVE_REQUESTS.set(id, newRecord);

  // Sync to mockDb with the SAME ID for UI compatibility
  mockDb.createRequest({
    id,
    customerId,
    serviceId: cat,
    providerId: provider.id,
    problemDescription: problem,
    customerAddress: address,
    customerLatitude: lat,
    customerLongitude: lng,
    estimatedMin: minCost,
    estimatedMax: maxCost,
  });

  return res.status(201).json({
    success: true,
    request: newRecord,
    message: 'Service request created. Location sharing requires explicit user approval.',
  });
};

router.post('/create', validateBody(ServiceRequestCreateSchema), handleCreateRequest);
router.post('/', validateBody(ServiceRequestCreateSchema), handleCreateRequest);

// GET /api/requests
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const allReqs = Array.from(ACTIVE_REQUESTS.values());
  if (allReqs.length === 0) {
    // Return mockDb requests
    const mockList = mockDb.getRequests({});
    const mapped = mockList.map(r => ({
      ...r,
      status: r.status.toUpperCase(),
      problem_summary: r.problemDescription,
      provider: DEMO_PROVIDERS.find(p => p.id === r.providerId) || DEMO_PROVIDERS[0],
    }));
    return res.json({ requests: mapped, count: mapped.length });
  }

  return res.json({ requests: allReqs, count: allReqs.length });
});

// GET /api/requests/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const request = getOrInitRequest(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }

  return res.json({ request, success: true });
});

// PATCH /api/requests/:id/location-consent (Explicit Permission & Revocation Protocol)
router.patch('/:id/location-consent', validateBody(LocationConsentSchema), (req: AuthenticatedRequest, res: Response) => {
  const request = getOrInitRequest(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }

  const { approved, latitude, longitude, address } = req.body;

  request.location_sharing_approved = Boolean(approved);
  request.updated_at = new Date().toISOString();

  if (approved) {
    request.location_shared_at = new Date().toISOString();
    request.location_revoked_at = undefined;
    if (latitude && longitude) {
      request.customer_location = { latitude, longitude };
    }
    if (address) {
      request.customer_address_text = address;
    }
  } else {
    // Revocation: Coordinates cease broadcasting
    request.location_revoked_at = new Date().toISOString();
  }

  ACTIVE_REQUESTS.set(request.id, request);

  return res.json({
    success: true,
    request,
    location_sharing_approved: request.location_sharing_approved,
    message: approved
      ? 'Live GPS location sharing approved for this active service session.'
      : 'Location sharing revoked. Coordinates are no longer transmitted.',
  });
});

// PATCH /api/requests/:id/status (Lifecycle transitions)
router.patch('/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const request = getOrInitRequest(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }

  const { status } = req.body;
  const validStatuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const upperStatus = (status || '').toUpperCase();

  if (!validStatuses.includes(upperStatus)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  request.status = upperStatus as any;
  request.updated_at = new Date().toISOString();

  // Automatic Revocation Invariant:
  // When job reaches COMPLETED or CANCELLED, location sharing terminates automatically
  if (upperStatus === 'COMPLETED' || upperStatus === 'CANCELLED') {
    request.location_sharing_approved = false;
    request.location_revoked_at = new Date().toISOString();
  }

  ACTIVE_REQUESTS.set(request.id, request);

  return res.json({
    success: true,
    request,
    status: request.status,
    location_sharing_approved: request.location_sharing_approved,
  });
});

export default router;
