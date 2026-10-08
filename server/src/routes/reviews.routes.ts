import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { CreateReviewSchema } from '../schemas/index.js';
import { mockDb } from '../data/mockDb.js';

const router = Router();

// POST /api/reviews
router.post('/', validateBody(CreateReviewSchema), (req: AuthenticatedRequest, res: Response) => {
  const { requestId, providerId, rating, reviewText } = req.body;
  const customerId = req.user?.id || 'cust-rahul-01';
  const customerName = req.user?.fullName || 'Rahul Sharma';

  const existing = mockDb.getReviewByRequest(requestId);
  if (existing) {
    return res.status(400).json({ error: 'You have already submitted a review for this service request.' });
  }

  const review = mockDb.createReview({
    requestId,
    customerId,
    customerName,
    providerId,
    rating,
    reviewText: reviewText || '',
  });

  return res.status(201).json({
    success: true,
    review,
    message: 'Thank you for rating your service provider!',
  });
});

// GET /api/reviews/provider/:providerId
router.get('/provider/:providerId', (req: AuthenticatedRequest, res: Response) => {
  const reviews = mockDb.getReviewsByProvider(req.params.providerId);
  return res.json({ reviews, count: reviews.length });
});

export default router;
