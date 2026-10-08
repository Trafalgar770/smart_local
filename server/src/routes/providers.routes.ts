import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { mockDb } from '../data/mockDb.js';
import { DEMO_PROVIDERS, rankProviders } from '../services/geoService.js';
import { ServiceCategory } from '../schemas/index.js';

const router = Router();

// GET /api/providers/match (Mandatory Master Prompt Endpoint)
router.get('/match', (req: AuthenticatedRequest, res: Response) => {
  const category = (req.query.category as string)?.toUpperCase() as ServiceCategory | undefined;
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

  const ranked = rankProviders(DEMO_PROVIDERS, category, lat, lng);

  return res.json({
    success: true,
    providers: ranked,
    count: ranked.length,
    matchedCategory: category || 'ALL',
    searchCenter: {
      latitude: lat || 12.9716,
      longitude: lng || 77.5946,
    },
  });
});

// GET /api/providers/nearby (Alias for proximity ranking)
router.get('/nearby', (req: AuthenticatedRequest, res: Response) => {
  const category = (req.query.category as string || req.query.serviceId as string)?.toUpperCase() as ServiceCategory | undefined;
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

  const ranked = rankProviders(DEMO_PROVIDERS, category, lat, lng);

  return res.json({
    providers: ranked,
    count: ranked.length,
    origin: {
      latitude: lat || 12.9716,
      longitude: lng || 77.5946,
      label: 'Customer Location',
    },
  });
});

// GET /api/providers
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const category = (req.query.category as string)?.toUpperCase() as ServiceCategory | undefined;
  const providers = category
    ? DEMO_PROVIDERS.filter(p => p.categories.includes(category))
    : DEMO_PROVIDERS;

  return res.json({ providers, count: providers.length });
});

// GET /api/providers/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const provider = DEMO_PROVIDERS.find(p => p.id === req.params.id) || mockDb.getProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  const reviews = mockDb.getReviewsByProvider(provider.id);

  return res.json({
    provider,
    reviews,
  });
});

// PATCH /api/providers/status
router.patch('/status', (req: AuthenticatedRequest, res: Response) => {
  const { status, providerId } = req.body;
  const isAvailable = status === 'available' || status === 'ONLINE' || status === true;

  const targetId = providerId || 'b0000001-0001-0001-0001-000000000001';
  const provider = DEMO_PROVIDERS.find(p => p.id === targetId);
  if (provider) {
    provider.is_available = isAvailable;
  }

  return res.json({
    success: true,
    provider: provider || { id: targetId, is_available: isAvailable },
  });
});

export default router;
