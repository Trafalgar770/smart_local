import { Router, Response } from 'express';
import { mockDb, UserProfile, ProviderProfile } from '../data/mockDb.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { RegisterUserSchema, LoginUserSchema } from '../schemas/index.js';

const router = Router();

// GET /api/auth/me
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }

  let providerProfile: ProviderProfile | undefined;
  if (req.user.role === 'provider') {
    providerProfile = mockDb.getProviderByUserId(req.user.id);
  }

  return res.json({
    user: req.user,
    providerProfile: providerProfile || null,
  });
});

// POST /api/auth/login
router.post('/login', validateBody(LoginUserSchema), (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  const user = mockDb.getProfileByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address' });
  }

  let providerProfile: ProviderProfile | undefined;
  if (user.role === 'provider') {
    providerProfile = mockDb.getProviderByUserId(user.id);
  }

  return res.json({
    token: `demo-token-${user.id}`,
    user,
    providerProfile: providerProfile || null,
    message: 'Login successful',
  });
});

// POST /api/auth/register
router.post('/register', validateBody(RegisterUserSchema), (req: AuthenticatedRequest, res: Response) => {
  const { email, fullName, phone, role, businessName, serviceCategoryIds, serviceArea } = req.body;

  const existing = mockDb.getProfileByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUserId = `user-${Date.now()}`;
  const newProfile: UserProfile = {
    id: newUserId,
    email,
    fullName,
    phone,
    avatarUrl: role === 'provider'
      ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role,
    createdAt: new Date().toISOString(),
  };

  mockDb.createProfile(newProfile);

  let newProviderProfile: ProviderProfile | undefined;
  if (role === 'provider') {
    newProviderProfile = {
      id: `prov-${Date.now()}`,
      userId: newUserId,
      businessName: businessName || `${fullName}'s Services`,
      description: 'Professional verified local service partner.',
      phone,
      avatarUrl: newProfile.avatarUrl,
      serviceArea: serviceArea || 'Local City Area (Within 10 km)',
      latitude: 28.6315 + (Math.random() - 0.5) * 0.05,
      longitude: 77.2167 + (Math.random() - 0.5) * 0.05,
      availabilityStatus: 'available',
      verified: true,
      averageRating: 5.0,
      completedJobs: 0,
      responseTimeMinutes: 15,
      serviceIds: serviceCategoryIds || ['11111111-1111-1111-1111-000000000001'],
      basePrice: 299,
      createdAt: new Date().toISOString(),
    };
    mockDb.createProviderProfile(newProviderProfile);
  }

  return res.status(201).json({
    token: `demo-token-${newProfile.id}`,
    user: newProfile,
    providerProfile: newProviderProfile || null,
    message: 'Registration successful',
  });
});

// POST /api/auth/demo-switch (Quick persona switcher for hackathon judges & testers)
router.post('/demo-switch', (req: AuthenticatedRequest, res: Response) => {
  const { persona } = req.body; // 'customer' | 'provider-mechanic' | 'provider-electrician'

  let targetUserId = 'cust-rahul-01';
  if (persona === 'provider-mechanic') {
    targetUserId = 'prov-user-vikram';
  } else if (persona === 'provider-electrician') {
    targetUserId = 'prov-user-rajesh';
  } else if (persona === 'customer') {
    targetUserId = 'cust-rahul-01';
  }

  const user = mockDb.getProfileById(targetUserId);
  if (!user) {
    return res.status(404).json({ error: 'Demo persona not found' });
  }

  let providerProfile: ProviderProfile | undefined;
  if (user.role === 'provider') {
    providerProfile = mockDb.getProviderByUserId(user.id);
  }

  return res.json({
    token: `demo-token-${user.id}`,
    user,
    providerProfile: providerProfile || null,
    message: `Switched active persona to ${user.fullName} (${user.role})`,
  });
});

// POST /api/auth/logout
router.post('/logout', (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
