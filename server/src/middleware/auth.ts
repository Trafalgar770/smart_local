import { Request, Response, NextFunction } from 'express';
import { mockDb, UserProfile } from '../data/mockDb.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 1. Check for custom demo headers
  const demoUserId = req.headers['x-demo-user-id'] as string;
  const authHeader = req.headers.authorization;

  if (demoUserId) {
    const profile = mockDb.getProfileById(demoUserId);
    if (profile) {
      req.user = profile;
      return next();
    }
  }

  // 2. Check Bearer token (supports mock tokens like "Bearer demo-token-cust-rahul-01")
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.startsWith('demo-token-')) {
      const uId = token.replace('demo-token-', '');
      const profile = mockDb.getProfileById(uId);
      if (profile) {
        req.user = profile;
        return next();
      }
    }
  }

  // 3. In development/demo, default to customer Rahul Sharma if not specified
  const defaultProfile = mockDb.getProfileById('cust-rahul-01');
  if (defaultProfile) {
    req.user = defaultProfile;
  }

  next();
}

export function requireRole(role: 'customer' | 'provider' | 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Forbidden: This action requires '${role}' privileges, you are logged in as '${req.user.role}'`
      });
    }
    next();
  };
}
