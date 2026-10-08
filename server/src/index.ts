import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ENV, isGeminiConfigured, isSupabaseConfigured, isGoogleMapsConfigured } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';

import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import servicesRoutes from './routes/services.routes.js';
import providersRoutes from './routes/providers.routes.js';
import requestsRoutes from './routes/requests.routes.js';
import locationRoutes from './routes/location.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import trackingRoutes from './routes/tracking.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Global Authentication parser
app.use(authMiddleware as any);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'online',
    product: 'SMART LOCAL SERVICE',
    environment: ENV.NODE_ENV,
    geminiConfigured: isGeminiConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
    googleMapsConfigured: isGoogleMapsConfigured(),
    cleaningForbiddenCheck: 'VERIFIED_REMOVED',
    timestamp: new Date().toISOString(),
  });
});

// Google Maps Config Check
app.get('/api/config/maps', (_req: Request, res: Response) => {
  return res.json({
    apiKey: ENV.GOOGLE_MAPS_API_KEY,
    configured: isGoogleMapsConfigured(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/requests/:id/location', locationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/tracking', trackingRoutes);

// 404 Handler for API
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// Combined Frontend Static Serving (SPA client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving unified frontend assets from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER_ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Start Server
app.listen(ENV.PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ SMART LOCAL SERVICE UNIFIED SERVER ON PORT ${ENV.PORT}`);
  console.log(`⚡ AI Mode: ${isGeminiConfigured() ? 'Gemini 3.8 Flash' : 'Deterministic Fallback Local Engine'}`);
  console.log(`⚡ Database: ${isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Integrated High-Fidelity Local Store'}`);
  console.log(`⚡ Unified App URL: http://localhost:${ENV.PORT}`);
  console.log(`⚡ Cleaning Service Status: COMPLETELY REMOVED`);
  console.log(`====================================================`);
});
