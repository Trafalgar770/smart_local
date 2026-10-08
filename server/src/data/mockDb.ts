import { SERVICES, ServiceDefinition } from './services.js';
import { AIAnalysisResult } from '../lib/fallbackAi.js';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  phone: string;
  avatarUrl: string;
  serviceArea: string;
  latitude: number;
  longitude: number;
  availabilityStatus: 'available' | 'busy' | 'offline';
  verified: boolean;
  averageRating: number;
  completedJobs: number;
  responseTimeMinutes: number;
  serviceIds: string[];
  basePrice: number;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  providerId?: string;
  serviceId: string;
  aiSessionId?: string;
  problemDescription: string;
  aiSummary?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  customerLatitude?: number;
  customerLongitude?: number;
  customerAddress?: string;
  status: 'request_sent' | 'accepted' | 'on_the_way' | 'arrived' | 'service_started' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface LocationShare {
  id: string;
  requestId: string;
  customerId: string;
  providerId?: string;
  permissionStatus: 'not_shared' | 'permission_requested' | 'shared' | 'stopped' | 'expired';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  sharedAt?: string;
  stoppedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationUpdate {
  id: string;
  locationShareId: string;
  actorId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  customerId: string;
  customerName?: string;
  providerId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

// Initial In-Memory State
const profiles: UserProfile[] = [
  {
    id: 'cust-rahul-01',
    email: 'rahul.customer@demo.local',
    fullName: 'Rahul Sharma',
    phone: '+91 98112 34567',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'customer',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prov-user-vikram',
    email: 'vikram.garage@demo.local',
    fullName: 'Vikram Singh',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    role: 'provider',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prov-user-rajesh',
    email: 'rajesh.electric@demo.local',
    fullName: 'Rajesh Kumar',
    phone: '+91 98234 56789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'provider',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prov-user-amit',
    email: 'amit.plumbing@demo.local',
    fullName: 'Amit Verma',
    phone: '+91 98991 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'provider',
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prov-user-priya',
    email: 'priya.towing@demo.local',
    fullName: 'Priya Quick Tow & Fuel',
    phone: '+91 98100 99887',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    role: 'provider',
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prov-user-sunil',
    email: 'sunil.ac@demo.local',
    fullName: 'Sunil Refrigeration & AC',
    phone: '+91 98118 77665',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'provider',
    createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
  }
];

const providerProfiles: ProviderProfile[] = [
  {
    id: 'prov-vikram-garage',
    userId: 'prov-user-vikram',
    businessName: 'Vikram Auto & Roadside Rescue',
    description: 'Expert 24x7 roadside mechanics for cars, bikes, emergency jump starts, and on-spot tubeless puncture patching.',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150',
    serviceArea: 'Central Delhi, Connaught Place, Karol Bagh, Pusa Road (Within 12 km)',
    latitude: 28.6410,
    longitude: 77.2010,
    availabilityStatus: 'available',
    verified: true,
    averageRating: 4.88,
    completedJobs: 142,
    responseTimeMinutes: 12,
    serviceIds: [
      '11111111-1111-1111-1111-000000000006', // Bike Mechanic
      '11111111-1111-1111-1111-000000000007', // Car Mechanic
      '11111111-1111-1111-1111-000000000008', // Puncture Repair
      '11111111-1111-1111-1111-000000000009', // Battery / Jump Start
      '11111111-1111-1111-1111-000000000005', // Fuel Delivery
    ],
    basePrice: 299,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prov-rajesh-electric',
    userId: 'prov-user-rajesh',
    businessName: 'Rajesh Certified Electricals',
    description: 'Govt. licensed electrician. Rapid response for MCB tripping, short circuits, switchboards, inverters, and ceiling fans.',
    phone: '+91 98234 56789',
    avatarUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
    serviceArea: 'Paharganj, New Delhi, Civil Lines, Chandni Chowk (Within 10 km)',
    latitude: 28.6430,
    longitude: 77.2150,
    availabilityStatus: 'available',
    verified: true,
    averageRating: 4.92,
    completedJobs: 189,
    responseTimeMinutes: 15,
    serviceIds: [
      '11111111-1111-1111-1111-000000000002', // Electrician
      '11111111-1111-1111-1111-000000000016', // Appliance Repair
    ],
    basePrice: 349,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prov-amit-plumbing',
    userId: 'prov-user-amit',
    businessName: 'Amit Express Plumbing Care',
    description: 'High-pressure pipe leak fixing, bathroom diverters, flush tank repair, overhead tanks, and motorized pumps.',
    phone: '+91 98991 22334',
    avatarUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150',
    serviceArea: 'Rajendra Nagar, Patel Nagar, Karol Bagh (Within 8 km)',
    latitude: 28.6380,
    longitude: 77.1890,
    availabilityStatus: 'available',
    verified: true,
    averageRating: 4.75,
    completedJobs: 98,
    responseTimeMinutes: 18,
    serviceIds: [
      '11111111-1111-1111-1111-000000000001', // Plumber
    ],
    basePrice: 249,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prov-priya-towing',
    userId: 'prov-user-priya',
    businessName: 'Priya Express Towing & Fuel Dispatch',
    description: 'Heavy duty flatbed and hydraulic towing. Highway emergency petrol/diesel drop off with GPS location matching.',
    phone: '+91 98100 99887',
    avatarUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150',
    serviceArea: 'Ring Road, Delhi-Gurgaon Expressway, DND Flyway, Noida Toll',
    latitude: 28.6500,
    longitude: 77.2250,
    availabilityStatus: 'available',
    verified: true,
    averageRating: 4.81,
    completedJobs: 114,
    responseTimeMinutes: 20,
    serviceIds: [
      '11111111-1111-1111-1111-000000000010', // Towing
      '11111111-1111-1111-1111-000000000005', // Fuel Delivery
      '11111111-1111-1111-1111-000000000009', // Battery / Jump Start
    ],
    basePrice: 1200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prov-sunil-ac',
    userId: 'prov-user-sunil',
    businessName: 'Sunil Cool Care & Appliance Hub',
    description: 'Specialists in inverter split AC gas filling, compressor repair, PCB diagnostics, refrigerators and microwaves.',
    phone: '+91 98118 77665',
    avatarUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150',
    serviceArea: 'West & Central Delhi, Shadipur, Naraina, Rajouri Garden',
    latitude: 28.6510,
    longitude: 77.1650,
    availabilityStatus: 'available',
    verified: true,
    averageRating: 4.84,
    completedJobs: 165,
    responseTimeMinutes: 25,
    serviceIds: [
      '11111111-1111-1111-1111-000000000012', // AC Repair
      '11111111-1111-1111-1111-000000000016', // Appliance Repair
    ],
    basePrice: 399,
    createdAt: new Date().toISOString(),
  }
];

const aiSessions: Map<string, AIAnalysisResult> = new Map();

const serviceRequests: ServiceRequest[] = [
  {
    id: 'req-demo-001',
    customerId: 'cust-rahul-01',
    providerId: 'prov-vikram-garage',
    serviceId: '11111111-1111-1111-1111-000000000006', // Bike Mechanic
    problemDescription: 'Bike engine stopped near Metro Gate 3, kick start feels totally loose and electric starter just clicks.',
    aiSummary: 'Likely dead battery or loose starter relay with loose kick compression. Recommended Bike Mechanic inspection.',
    estimatedMin: 299,
    estimatedMax: 650,
    customerLatitude: 28.6315,
    customerLongitude: 77.2167,
    customerAddress: 'Outer Circle, Connaught Place, New Delhi',
    status: 'on_the_way',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-demo-002',
    customerId: 'cust-rahul-01',
    providerId: 'prov-rajesh-electric',
    serviceId: '11111111-1111-1111-1111-000000000002', // Electrician
    problemDescription: 'Main MCB keeps tripping whenever geyser is turned on in morning.',
    aiSummary: 'Heating coil earth leakage or geyser element short circuit. Repaired geyser element wiring.',
    estimatedMin: 350,
    estimatedMax: 850,
    customerLatitude: 28.6315,
    customerLongitude: 77.2167,
    customerAddress: 'Barakhamba Road, New Delhi',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
  }
];

const locationShares: Map<string, LocationShare> = new Map([
  [
    'req-demo-001',
    {
      id: 'loc-share-demo-01',
      requestId: 'req-demo-001',
      customerId: 'cust-rahul-01',
      providerId: 'prov-vikram-garage',
      permissionStatus: 'shared',
      latitude: 28.6315,
      longitude: 77.2167,
      accuracy: 12,
      address: 'Outer Circle, Connaught Place, New Delhi',
      sharedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    }
  ],
  [
    'req-demo-002',
    {
      id: 'loc-share-demo-02',
      requestId: 'req-demo-002',
      customerId: 'cust-rahul-01',
      providerId: 'prov-rajesh-electric',
      permissionStatus: 'stopped', // Automatically stopped upon completion!
      latitude: 28.6315,
      longitude: 77.2167,
      accuracy: 15,
      address: 'Barakhamba Road, New Delhi',
      sharedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      stoppedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    }
  ]
]);

const locationUpdates: LocationUpdate[] = [
  {
    id: 'upd-1',
    locationShareId: 'loc-share-demo-01',
    actorId: 'prov-vikram-garage',
    latitude: 28.6410,
    longitude: 77.2010,
    accuracy: 10,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'upd-2',
    locationShareId: 'loc-share-demo-01',
    actorId: 'prov-vikram-garage',
    latitude: 28.6375,
    longitude: 77.2070,
    accuracy: 8,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'upd-3',
    locationShareId: 'loc-share-demo-01',
    actorId: 'prov-vikram-garage',
    latitude: 28.6342,
    longitude: 77.2120,
    accuracy: 6,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  }
];

const reviews: Review[] = [
  {
    id: 'rev-001',
    requestId: 'req-demo-002',
    customerId: 'cust-rahul-01',
    customerName: 'Rahul Sharma',
    providerId: 'prov-rajesh-electric',
    rating: 5,
    reviewText: 'Super fast arrival! Replaced the burnt geyser terminal within 30 minutes. Extremely polite and explained the safety MCB operation.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 50 * 60 * 1000).toISOString(),
  }
];

const messages: Message[] = [
  {
    id: 'msg-01',
    requestId: 'req-demo-001',
    senderId: 'prov-user-vikram',
    senderName: 'Vikram Singh (Mechanic)',
    receiverId: 'cust-rahul-01',
    message: 'Namaste Rahul ji, I have accepted your roadside request. I am packing starter cables and spark plugs, leaving now.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-02',
    requestId: 'req-demo-001',
    senderId: 'cust-rahul-01',
    senderName: 'Rahul Sharma',
    receiverId: 'prov-user-vikram',
    message: 'Thanks Vikram! I am waiting near Metro Gate 3 next to the ATM booth. My bike is a black Pulsar 150.',
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-03',
    requestId: 'req-demo-001',
    senderId: 'prov-user-vikram',
    senderName: 'Vikram Singh (Mechanic)',
    receiverId: 'cust-rahul-01',
    message: 'Understood. I just crossed Pusa road circle. Seeing your live GPS pin, will reach in approximately 7 minutes.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  }
];

// Distance helper using Haversine formula (km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const mockDb = {
  // Users & Profiles
  getProfiles: () => profiles,
  getProfileById: (id: string) => profiles.find(p => p.id === id),
  getProfileByEmail: (email: string) => profiles.find(p => p.email.toLowerCase() === email.toLowerCase()),
  createProfile: (profile: UserProfile) => {
    profiles.push(profile);
    return profile;
  },

  // Providers
  getProviders: () => providerProfiles,
  getProviderById: (id: string) => providerProfiles.find(p => p.id === id),
  getProviderByUserId: (userId: string) => providerProfiles.find(p => p.userId === userId),
  createProviderProfile: (prov: ProviderProfile) => {
    providerProfiles.push(prov);
    return prov;
  },
  updateProviderStatus: (id: string, status: 'available' | 'busy' | 'offline') => {
    const prov = providerProfiles.find(p => p.id === id);
    if (prov) {
      prov.availabilityStatus = status;
    }
    return prov;
  },

  // Services
  getServices: () => SERVICES,
  getServiceById: (id: string) => SERVICES.find(s => s.id === id),
  getServiceBySlug: (slug: string) => SERVICES.find(s => s.slug === slug),

  // Ranking & Nearby Providers
  getNearbyProviders: (params: {
    serviceId?: string;
    latitude?: number;
    longitude?: number;
    maxDistanceKm?: number;
    minRating?: number;
  }) => {
    const userLat = params.latitude || 28.6315;
    const userLng = params.longitude || 77.2167;
    const maxDist = params.maxDistanceKm || 25;

    let list = providerProfiles.map(p => {
      const distanceKm = calculateDistanceKm(userLat, userLng, p.latitude, p.longitude);
      const serviceMatch = params.serviceId ? p.serviceIds.includes(params.serviceId) : true;
      
      // Estimated arrival time based on distance (3 min per km + response base)
      const estimatedArrivalMinutes = Math.round(p.responseTimeMinutes + distanceKm * 3);

      // Ranking score formula:
      // High rating + high completed jobs + short distance + availability
      let rankingScore = 0;
      if (serviceMatch) rankingScore += 100;
      rankingScore += (p.averageRating / 5) * 40;
      rankingScore += Math.min(p.completedJobs / 10, 25);
      rankingScore += Math.max(0, 30 - distanceKm * 2);
      if (p.availabilityStatus === 'available') rankingScore += 30;
      else if (p.availabilityStatus === 'busy') rankingScore += 5;

      return {
        ...p,
        distanceKm,
        estimatedArrivalMinutes,
        serviceMatch,
        rankingScore: Math.round(rankingScore),
      };
    });

    if (params.serviceId) {
      list = list.filter(p => p.serviceMatch);
    }

    if (params.minRating) {
      list = list.filter(p => p.averageRating >= params.minRating!);
    }

    list = list.filter(p => p.distanceKm <= maxDist);

    // Sort descending by ranking score
    list.sort((a, b) => b.rankingScore - a.rankingScore);

    return list;
  },

  // AI Sessions
  saveAiSession: (session: AIAnalysisResult) => {
    aiSessions.set(session.sessionId, session);
    return session;
  },
  getAiSession: (id: string) => aiSessions.get(id),
  getAllAiSessions: () => Array.from(aiSessions.values()),

  // Service Requests
  getRequests: (filter?: { customerId?: string; providerId?: string }) => {
    return serviceRequests.filter(r => {
      if (filter?.customerId && r.customerId !== filter.customerId) return false;
      if (filter?.providerId && r.providerId !== filter.providerId) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getRequestById: (id: string) => serviceRequests.find(r => r.id === id),
  createRequest: (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }) => {
    const newReq: ServiceRequest = {
      ...data,
      id: data.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'request_sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    serviceRequests.unshift(newReq);

    // Automatically create a corresponding location_shares record in 'not_shared' state
    const locShare: LocationShare = {
      id: `loc-${Date.now()}`,
      requestId: newReq.id,
      customerId: newReq.customerId,
      providerId: newReq.providerId,
      permissionStatus: 'not_shared',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    locationShares.set(newReq.id, locShare);

    return newReq;
  },
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => {
    const req = serviceRequests.find(r => r.id === id);
    if (!req) return null;

    req.status = status;
    req.updatedAt = new Date().toISOString();

    // MANDATORY REQUIREMENT: Automatic location-sharing termination upon completed or cancelled!
    if (status === 'completed' || status === 'cancelled') {
      const share = locationShares.get(id);
      if (share && share.permissionStatus === 'shared') {
        share.permissionStatus = 'stopped';
        share.stoppedAt = new Date().toISOString();
        share.updatedAt = new Date().toISOString();
      }
    }

    return req;
  },

  // Location Sharing
  getLocationShare: (requestId: string) => locationShares.get(requestId),
  updateLocationPermission: (
    requestId: string,
    permission: 'shared' | 'not_shared' | 'stopped',
    coords?: { latitude?: number; longitude?: number; accuracy?: number; address?: string }
  ) => {
    let share = locationShares.get(requestId);
    if (!share) {
      const req = serviceRequests.find(r => r.id === requestId);
      if (!req) return null;
      share = {
        id: `loc-${Date.now()}`,
        requestId,
        customerId: req.customerId,
        providerId: req.providerId,
        permissionStatus: permission,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      locationShares.set(requestId, share);
    }

    share.permissionStatus = permission;
    share.updatedAt = new Date().toISOString();

    if (permission === 'shared') {
      share.sharedAt = new Date().toISOString();
      share.expiresAt = new Date(Date.now() + 120 * 60 * 1000).toISOString(); // 2 hour safety window
      if (coords?.latitude) share.latitude = coords.latitude;
      if (coords?.longitude) share.longitude = coords.longitude;
      if (coords?.accuracy) share.accuracy = coords.accuracy;
      if (coords?.address) share.address = coords.address;

      if (coords?.latitude && coords?.longitude) {
        locationUpdates.push({
          id: `upd-${Date.now()}`,
          locationShareId: share.id,
          actorId: share.customerId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (permission === 'stopped') {
      share.stoppedAt = new Date().toISOString();
    }

    return share;
  },
  addLocationUpdate: (update: Omit<LocationUpdate, 'id' | 'createdAt'>) => {
    const newUpd: LocationUpdate = {
      ...update,
      id: `upd-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    locationUpdates.push(newUpd);
    return newUpd;
  },
  getLocationUpdates: (locationShareId: string) => {
    return locationUpdates.filter(u => u.locationShareId === locationShareId);
  },

  // Messages
  getMessages: (requestId: string) => {
    return messages.filter(m => m.requestId === requestId);
  },
  createMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMsg);
    return newMsg;
  },

  // Reviews
  getReviewsByProvider: (providerId: string) => {
    return reviews.filter(r => r.providerId === providerId);
  },
  getReviewByRequest: (requestId: string) => {
    return reviews.find(r => r.requestId === requestId);
  },
  createReview: (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newRev);

    // Update provider average rating & completed count
    const prov = providerProfiles.find(p => p.id === review.providerId);
    if (prov) {
      const provReviews = reviews.filter(r => r.providerId === review.providerId);
      const totalScore = provReviews.reduce((sum, r) => sum + r.rating, 0);
      prov.averageRating = Math.round((totalScore / provReviews.length) * 100) / 100;
      prov.completedJobs += 1;
    }

    return newRev;
  }
};
