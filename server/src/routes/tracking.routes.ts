import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ACTIVE_REQUESTS, getOrInitRequest } from './requests.routes.js';
import { DEMO_PROVIDERS, calculateETA, calculateHaversineDistance, fetchGoogleMapsDistanceAndETA } from '../services/geoService.js';

const router = Router();

// Store live provider locations
interface TrackingState {
  requestId: string;
  providerId: string;
  providerLocation: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
  heading: number;
  speedKmh: number;
  etaMinutes: number;
  distanceKm: number;
  locationSharingApproved: boolean;
  status: string;
  updatedAt: string;
}

const LIVE_TRACKING: Map<string, TrackingState> = new Map();

// GET /api/tracking/:requestId
router.get('/:requestId', async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const request = getOrInitRequest(requestId);

  if (!request && !LIVE_TRACKING.has(requestId)) {
    return res.status(404).json({ success: false, error: 'Tracking session not found or expired' });
  }

  const provider = request
    ? DEMO_PROVIDERS.find(p => p.id === request.provider_id) || DEMO_PROVIDERS[0]
    : DEMO_PROVIDERS[0];

  // Default coordinates (e.g., Bangalore or Delhi)
  let custLat = request?.customer_location?.latitude || 12.9716;
  let custLng = request?.customer_location?.longitude || 77.5946;

  let provLat = provider.latitude;
  let provLng = provider.longitude;

  // Check if simulated movement state exists
  let tracking = LIVE_TRACKING.get(requestId);

  if (!tracking) {
    const { distanceKm, etaMinutes } = await fetchGoogleMapsDistanceAndETA(provLat, provLng, custLat, custLng);

    tracking = {
      requestId,
      providerId: provider.id,
      providerLocation: { latitude: provLat, longitude: provLng },
      customerLocation: request?.location_sharing_approved ? { latitude: custLat, longitude: custLng } : undefined,
      heading: 45.0,
      speedKmh: 28.5,
      etaMinutes,
      distanceKm,
      locationSharingApproved: Boolean(request?.location_sharing_approved),
      status: request?.status || 'ON_THE_WAY',
      updatedAt: new Date().toISOString(),
    };
    LIVE_TRACKING.set(requestId, tracking);
  } else {
    // Update live sharing state from the request
    tracking.locationSharingApproved = Boolean(request?.location_sharing_approved);
    tracking.status = request?.status || tracking.status;
    if (request?.location_sharing_approved && request?.customer_location) {
      tracking.customerLocation = request.customer_location;
    } else if (!request?.location_sharing_approved) {
      tracking.customerLocation = undefined;
    }
  }

  return res.json({
    success: true,
    tracking: {
      ...tracking,
      // If customer revoked sharing, hide exact customer coordinates from response
      customerLocation: tracking.locationSharingApproved ? tracking.customerLocation : null,
      provider: {
        id: provider.id,
        business_name: provider.business_name,
        rating: provider.rating,
        phone_number: provider.phone_number,
        avatar_url: provider.avatar_url,
      },
    },
  });
});

// POST /api/tracking/update
router.post('/update', async (req: AuthenticatedRequest, res: Response) => {
  const { requestId, providerId, latitude, longitude, heading = 0, speedKmh = 25 } = req.body;

  if (!requestId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'requestId, latitude, and longitude are required' });
  }

  const request = ACTIVE_REQUESTS.get(requestId);
  const custLat = request?.customer_location?.latitude || 12.9716;
  const custLng = request?.customer_location?.longitude || 77.5946;

  const { distanceKm, etaMinutes } = await fetchGoogleMapsDistanceAndETA(latitude, longitude, custLat, custLng);

  const updated: TrackingState = {
    requestId,
    providerId: providerId || request?.provider_id || 'demo-provider',
    providerLocation: { latitude, longitude },
    customerLocation: request?.location_sharing_approved ? { latitude: custLat, longitude: custLng } : undefined,
    heading,
    speedKmh,
    etaMinutes,
    distanceKm,
    locationSharingApproved: Boolean(request?.location_sharing_approved),
    status: request?.status || 'ON_THE_WAY',
    updatedAt: new Date().toISOString(),
  };

  LIVE_TRACKING.set(requestId, updated);

  return res.json({
    success: true,
    tracking: updated,
  });
});

// POST /api/tracking/simulate-step (Demo Tracking Simulator)
router.post('/simulate-step', async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.body;
  const tracking = LIVE_TRACKING.get(requestId);

  if (!tracking) {
    return res.status(404).json({ error: 'Tracking session not active' });
  }

  const request = getOrInitRequest(requestId);
  const targetLat = request?.customer_location?.latitude || 12.9716;
  const targetLng = request?.customer_location?.longitude || 77.5946;

  // Step 12% closer towards target
  const currLat = tracking.providerLocation.latitude;
  const currLng = tracking.providerLocation.longitude;

  const stepRatio = 0.12;
  const newLat = currLat + (targetLat - currLat) * stepRatio;
  const newLng = currLng + (targetLng - currLng) * stepRatio;

  const { distanceKm, etaMinutes } = await fetchGoogleMapsDistanceAndETA(newLat, newLng, targetLat, targetLng);

  tracking.providerLocation = { latitude: newLat, longitude: newLng };
  tracking.distanceKm = distanceKm;
  tracking.etaMinutes = etaMinutes;
  tracking.updatedAt = new Date().toISOString();

  if (distanceKm < 0.2 && request) {
    request.status = 'ARRIVED';
    tracking.status = 'ARRIVED';
  }

  LIVE_TRACKING.set(requestId, tracking);

  return res.json({
    success: true,
    tracking,
  });
});

export default router;
