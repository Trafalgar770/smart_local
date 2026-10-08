/**
 * Google Maps Dynamic Loader Utility
 * Securely loads Google Maps JavaScript SDK, validates coordinates,
 * and handles authentication and network failovers gracefully.
 */

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

// Clean environment variable resolution with no hardcoded fallback
export const GOOGLE_MAPS_API_KEY =
  ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';

let loadPromise: Promise<boolean> | null = null;
let googleMapsLoadError = false;
let hasAuthFailed = false;
const authFailureListeners = new Set<() => void>();

/**
 * Register a listener that fires immediately if Google Maps fails authentication (e.g. invalid key or restrictions).
 */
export function subscribeToGoogleMapsAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);
  if (hasAuthFailed) {
    listener();
  }
  return () => {
    authFailureListeners.delete(listener);
  };
}

// Setup global gm_authFailure handler early
if (typeof window !== 'undefined') {
  const previousAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    console.warn('[Google Maps] Authentication failed. Switching seamlessly to fallback.');
    hasAuthFailed = true;
    googleMapsLoadError = true;
    authFailureListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in auth failure listener:', err);
      }
    });
    if (typeof previousAuthFailure === 'function') {
      try {
        previousAuthFailure();
      } catch (_) {}
    }
  };
}

// Dark theme map styling matching the app's aesthetic
export const GOOGLE_MAPS_DARK_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f291e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0b192c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

import { API_BASE } from '../services/api';

/**
 * Fetch effective API key from environment or server config endpoint.
 */
export async function getEffectiveApiKey(): Promise<string> {
  if (GOOGLE_MAPS_API_KEY) return GOOGLE_MAPS_API_KEY;
  try {
    const res = await fetch(`${API_BASE}/config/maps`);
    if (res.ok) {
      const data = await res.json();
      if (data?.apiKey) return data.apiKey;
    }
  } catch (_) {}
  return '';
}

/**
 * Robustly load Google Maps JS SDK without race conditions or uncaught errors.
 */
export async function loadGoogleMaps(explicitKey?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.google?.maps) return true;
  if (googleMapsLoadError || hasAuthFailed) return false;
  if (loadPromise) return loadPromise;

  const keyToUse = explicitKey || (await getEffectiveApiKey());
  if (!keyToUse) {
    console.warn('[Google Maps] No API key configured. Utilizing vector fallback.');
    googleMapsLoadError = true;
    return false;
  }

  loadPromise = new Promise<boolean>((resolve) => {
    // 6-second timeout to prevent infinite pending state
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps) {
        console.warn('[Google Maps] Loading timed out. Falling back gracefully.');
        googleMapsLoadError = true;
        resolve(false);
      }
    }, 6000);

    const onAuthFail = () => {
      clearTimeout(timeoutId);
      googleMapsLoadError = true;
      resolve(false);
    };

    const unsubscribe = subscribeToGoogleMapsAuthFailure(onAuthFail);

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      if (window.google?.maps) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(Boolean(window.google?.maps));
      });
      existingScript.addEventListener('error', () => {
        clearTimeout(timeoutId);
        unsubscribe();
        googleMapsLoadError = true;
        resolve(false);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      keyToUse
    )}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      clearTimeout(timeoutId);
      unsubscribe();
      if (window.google?.maps && !hasAuthFailed) {
        resolve(true);
      } else {
        googleMapsLoadError = true;
        resolve(false);
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      unsubscribe();
      console.warn('[Google Maps] Failed to load external script. Using fallback.');
      googleMapsLoadError = true;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google?.maps) && !googleMapsLoadError && !hasAuthFailed;
}

/**
 * Validate GPS coordinates to prevent InvalidValueError in Google Maps API.
 */
export function isValidCoordinates(lat: any, lng: any): boolean {
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    typeof numLat === 'number' &&
    !isNaN(numLat) &&
    typeof numLng === 'number' &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
}

/**
 * Generates an external turn-by-turn navigation URL for the native Google Maps app or web directions.
 */
export function getGoogleMapsNavigationUrl(
  originLat: number,
  originLng: number,
  destLat?: number | null,
  destLng?: number | null
): string {
  if (destLat !== undefined && destLat !== null && isValidCoordinates(destLat, destLng)) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${originLat},${originLng}`;
}
