import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { SendMessageSchema } from '../schemas/index.js';
import { mockDb } from '../data/mockDb.js';

const router = Router();

// GET /api/messages/:requestId
router.get('/:requestId', (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const messages = mockDb.getMessages(requestId);
  return res.json({ messages });
});

// POST /api/messages
router.post('/', validateBody(SendMessageSchema), (req: AuthenticatedRequest, res: Response) => {
  const { requestId, receiverId, message } = req.body;
  const senderId = req.user?.id || 'cust-rahul-01';
  const senderName = req.user?.fullName || 'Rahul Sharma';

  const newMsg = mockDb.createMessage({
    requestId,
    senderId,
    senderName,
    receiverId,
    message,
  });

  return res.status(201).json({ success: true, message: newMsg });
});

export default router;
