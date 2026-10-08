import { Router, Request, Response } from 'express';
import { SERVICES } from '../data/services.js';

const router = Router();

// GET /api/services
router.get('/', (_req: Request, res: Response) => {
  return res.json({
    services: SERVICES,
    count: SERVICES.length,
  });
});

// GET /api/services/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const service = SERVICES.find(s => s.id === id || s.slug === id.toLowerCase());

  if (!service) {
    return res.status(404).json({ error: 'Service category not found' });
  }

  return res.json({ service });
});

export default router;
