import { ServiceCategory } from '../schemas/index.js';
import { ENV, isGoogleMapsConfigured } from '../config/env.js';

export interface ProviderRecord {
  id: string;
  profile_id?: string;
  business_name: string;
  categories: ServiceCategory[];
  is_available: boolean;
  is_demo: boolean;
  rating: number;
  completed_jobs: number;
  min_price: number;
  max_price: number;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  phone_number?: string;
  avatar_url?: string;
  distance_km?: number;
  eta_minutes?: number;
}

export const DEMO_PROVIDERS: ProviderRecord[] = [
  {
    id: 'b0000001-0001-0001-0001-000000000001',
    business_name: 'Bangalore Quick Bike Doctor',
    categories: ['BIKE_MECHANIC', 'BATTERY_JUMPSTART', 'PUNCTURE_REPAIR', 'FUEL_DELIVERY'],
    is_available: true,
    is_demo: true,
    rating: 4.9,
    completed_jobs: 142,
    min_price: 299,
    max_price: 799,
    latitude: 12.9716,
    longitude: 77.5946,
    service_radius_km: 18.0,
    phone_number: '+919876543210',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000002',
    business_name: 'VoltCare Electrical & AC Experts',
    categories: ['ELECTRICIAN', 'AC_REPAIR', 'APPLIANCE_REPAIR'],
    is_available: true,
    is_demo: true,
    rating: 4.8,
    completed_jobs: 210,
    min_price: 349,
    max_price: 1299,
    latitude: 12.9352,
    longitude: 77.6245,
    service_radius_km: 15.0,
    phone_number: '+919876543211',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000003',
    business_name: 'Capital Express Plumbing & Masonry',
    categories: ['PLUMBER', 'MASON', 'LABOUR'],
    is_available: true,
    is_demo: true,
    rating: 4.7,
    completed_jobs: 185,
    min_price: 299,
    max_price: 999,
    latitude: 28.6315,
    longitude: 77.2167,
    service_radius_km: 20.0,
    phone_number: '+919876543212',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000004',
    business_name: 'NCR Rapid Highway Rescue & Towing',
    categories: ['TOWING', 'FUEL_DELIVERY', 'CAR_MECHANIC', 'BATTERY_JUMPSTART'],
    is_available: true,
    is_demo: true,
    rating: 4.9,
    completed_jobs: 310,
    min_price: 599,
    max_price: 2499,
    latitude: 28.4595,
    longitude: 77.0878,
    service_radius_km: 35.0,
    phone_number: '+919876543213',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000005',
    business_name: 'Mumbai Craft Wood & Metal Works',
    categories: ['CARPENTER', 'WELDER', 'PAINTER'],
    is_available: true,
    is_demo: true,
    rating: 4.6,
    completed_jobs: 98,
    min_price: 399,
    max_price: 1499,
    latitude: 19.1136,
    longitude: 72.8347,
    service_radius_km: 15.0,
    phone_number: '+919876543214',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000006',
    business_name: 'SafeShift Relocations & Labour',
    categories: ['MOVERS', 'LABOUR'],
    is_available: true,
    is_demo: true,
    rating: 4.8,
    completed_jobs: 160,
    min_price: 799,
    max_price: 4500,
    latitude: 19.0330,
    longitude: 72.9982,
    service_radius_km: 25.0,
    phone_number: '+919876543215',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000007',
    business_name: 'Cyberabad Appliance Care',
    categories: ['APPLIANCE_REPAIR', 'ELECTRICIAN', 'OTHER_SERVICES'],
    is_available: true,
    is_demo: true,
    rating: 4.9,
    completed_jobs: 275,
    min_price: 299,
    max_price: 1199,
    latitude: 17.4474,
    longitude: 78.3826,
    service_radius_km: 15.0,
    phone_number: '+919876543216',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'b0000001-0001-0001-0001-000000000008',
    business_name: 'Pune Express Roadside Assistance',
    categories: ['CAR_MECHANIC', 'BIKE_MECHANIC', 'PUNCTURE_REPAIR', 'FUEL_DELIVERY', 'TOWING'],
    is_available: true,
    is_demo: true,
    rating: 4.8,
    completed_jobs: 192,
    min_price: 299,
    max_price: 1499,
    latitude: 18.5204,
    longitude: 73.8567,
    service_radius_km: 20.0,
    phone_number: '+919876543217',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  },
];

/**
 * Haversine formula to compute distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Calculates estimated arrival time (minutes) assuming average Indian metro traffic speeds.
 */
export function calculateETA(distanceKm: number): number {
  const avgSpeedKmh = 25; // 25 km/h urban speed
  const transitMinutes = (distanceKm / avgSpeedKmh) * 60;
  const bufferPrepMinutes = 5;
  return Math.max(5, Math.round(transitMinutes + bufferPrepMinutes));
}

/**
 * Fetch real-world driving distance and duration from Google Maps Distance Matrix API.
 * Gracefully falls back to haversine calculation if offline or API key restricted.
 */
export async function fetchGoogleMapsDistanceAndETA(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<{ distanceKm: number; etaMinutes: number; source: 'google_maps' | 'haversine' }> {
  if (isGoogleMapsConfigured()) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          const meters = element.distance?.value ?? 0;
          const seconds = element.duration?.value ?? 0;
          return {
            distanceKm: Math.round((meters / 1000) * 10) / 10,
            etaMinutes: Math.max(1, Math.round(seconds / 60)),
            source: 'google_maps',
          };
        }
      }
    } catch (_err) {
      // Graceful fallback to haversine
    }
  }

  const distanceKm = calculateHaversineDistance(originLat, originLng, destLat, destLng);
  const etaMinutes = calculateETA(distanceKm);
  return { distanceKm, etaMinutes, source: 'haversine' };
}

/**
 * Rank providers dynamically using weighted scoring.
 */
export function rankProviders(
  providers: ProviderRecord[],
  category?: ServiceCategory,
  userLat?: number,
  userLng?: number
): ProviderRecord[] {
  let matched = providers.filter(p => {
    if (!category) return true;
    return p.categories.includes(category);
  });

  // If no providers match category directly, match fallback or all available
  if (matched.length === 0) {
    matched = providers;
  }

  return matched
    .map(p => {
      let distanceKm = 3.2; // default simulated distance
      if (userLat !== undefined && userLng !== undefined) {
        distanceKm = calculateHaversineDistance(userLat, userLng, p.latitude, p.longitude);
      }
      const etaMinutes = calculateETA(distanceKm);

      return {
        ...p,
        distance_km: distanceKm,
        eta_minutes: etaMinutes,
      };
    })
    .sort((a, b) => {
      // Primary: Availability
      if (a.is_available && !b.is_available) return -1;
      if (!a.is_available && b.is_available) return 1;

      // Secondary: Distance
      if (a.distance_km !== undefined && b.distance_km !== undefined) {
        if (Math.abs(a.distance_km - b.distance_km) > 1) {
          return a.distance_km - b.distance_km;
        }
      }

      // Tertiary: Rating
      return b.rating - a.rating;
    });
}
