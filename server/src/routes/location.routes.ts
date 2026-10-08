import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { LocationPermissionSchema, LocationUpdateSchema } from '../schemas/index.js';
import { mockDb } from '../data/mockDb.js';
import { getOrInitRequest } from './requests.routes.js';

const router = Router({ mergeParams: true });

// POST /api/requests/:id/location/permission
router.post('/permission', validateBody(LocationPermissionSchema), (req: AuthenticatedRequest, res: Response) => {
  const requestId = req.params.id;
  const { permissionStatus, latitude, longitude, accuracy, address } = req.body;

  let request = mockDb.getRequestById(requestId);
  if (!request) {
    const active = getOrInitRequest(requestId);
    if (active) {
      request = mockDb.getRequestById(requestId);
    }
  }

  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }

  // Ensure request is not already completed/cancelled
  if (['completed', 'cancelled'].includes(request.status)) {
    return res.status(400).json({ error: 'Cannot share location for a completed or cancelled request' });
  }

  const updatedShare = mockDb.updateLocationPermission(requestId, permissionStatus, {
    latitude: latitude || request.customerLatitude || 28.6315,
    longitude: longitude || request.customerLongitude || 77.2167,
    accuracy: accuracy || 10,
    address: address || request.customerAddress || 'Connaught Place, New Delhi',
  });

  return res.json({
    success: true,
    locationShare: updatedShare,
    message: permissionStatus === 'shared'
      ? 'Live location permission granted to provider for this active request.'
      : 'Location sharing has been stopped.',
  });
});

// POST /api/requests/:id/location/update
router.post('/update', validateBody(LocationUpdateSchema), (req: AuthenticatedRequest, res: Response) => {
  const requestId = req.params.id;
  const { latitude, longitude, accuracy } = req.body;

  const share = mockDb.getLocationShare(requestId);
  if (!share) {
    return res.status(404).json({ error: 'Location share not initiated' });
  }

  if (share.permissionStatus !== 'shared') {
    return res.status(403).json({ error: 'Cannot send location update: Location sharing is not active' });
  }

  const update = mockDb.addLocationUpdate({
    locationShareId: share.id,
    actorId: req.user?.id || 'unknown',
    latitude,
    longitude,
    accuracy: accuracy || 8,
  });

  // Update current coordinates on the share record
  share.latitude = latitude;
  share.longitude = longitude;
  share.updatedAt = new Date().toISOString();

  return res.json({ success: true, update });
});

// GET /api/requests/:id/location/status
router.get('/status', (req: AuthenticatedRequest, res: Response) => {
  const requestId = req.params.id;
  let request = mockDb.getRequestById(requestId);
  if (!request) {
    const active = getOrInitRequest(requestId);
    if (active) {
      request = mockDb.getRequestById(requestId);
    }
  }

  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }

  const share = mockDb.getLocationShare(requestId);
  if (!share) {
    return res.json({
      permissionStatus: 'not_shared',
      message: 'No location sharing configured for this request yet',
    });
  }

  const isCustomer = req.user?.id === request.customerId;
  const updates = mockDb.getLocationUpdates(share.id);

  // If requester is NOT customer and status is NOT shared, mask coordinates
  if (!isCustomer && share.permissionStatus !== 'shared') {
    return res.json({
      locationShare: {
        ...share,
        latitude: null,
        longitude: null,
        address: 'Protected: Customer has not granted location access',
      },
      updates: [],
    });
  }

  return res.json({
    locationShare: share,
    updates: updates.slice(-10), // latest 10 breadcrumbs
  });
});

export default router;
