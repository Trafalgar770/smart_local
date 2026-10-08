import React, { useEffect, useRef, useState } from 'react';
import {
  loadGoogleMaps,
  GOOGLE_MAPS_DARK_STYLE,
  isValidCoordinates,
  subscribeToGoogleMapsAuthFailure,
  getGoogleMapsNavigationUrl
} from '../utils/googleMapsLoader';
import { Compass, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

interface GoogleMapsCanvasProps {
  providerLocation: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number } | null;
  providerName: string;
  isLocationShared: boolean;
  className?: string;
  mapType?: 'roadmap' | 'satellite' | 'hybrid';
  onFallback?: () => void;
}

export function GoogleMapsCanvas({
  providerLocation,
  customerLocation,
  providerName,
  isLocationShared,
  className = 'w-full h-full',
  mapType = 'roadmap',
  onFallback,
}: GoogleMapsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const providerMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const customerCircleRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [currentMapType, setCurrentMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Validate coordinates safely
  const provLat = Number(providerLocation?.latitude);
  const provLng = Number(providerLocation?.longitude);
  const hasValidProvCoords = isValidCoordinates(provLat, provLng);

  const custLat = Number(customerLocation?.latitude);
  const custLng = Number(customerLocation?.longitude);
  const hasValidCustCoords = isValidCoordinates(custLat, custLng);

  // Subscribe to auth failures (e.g. key quota / restrictions)
  useEffect(() => {
    const unsubscribe = subscribeToGoogleMapsAuthFailure(() => {
      console.warn('[GoogleMapsCanvas] Caught authentication restriction. Activating fallback UI.');
      setLoadFailed(true);
      if (onFallback) onFallback();
    });
    return unsubscribe;
  }, [onFallback]);

  // Load Google Maps SDK
  useEffect(() => {
    let isMounted = true;
    loadGoogleMaps()
      .then((success) => {
        if (!isMounted) return;
        if (success && window.google?.maps) {
          setIsLoaded(true);
        } else {
          setLoadFailed(true);
          if (onFallback) onFallback();
        }
      })
      .catch((err) => {
        console.error('[GoogleMapsCanvas] Load error:', err);
        if (isMounted) {
          setLoadFailed(true);
          if (onFallback) onFallback();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onFallback]);

  // Initialize or update Map and Markers
  useEffect(() => {
    if (!isLoaded || loadFailed || !containerRef.current || !window.google?.maps || !hasValidProvCoords) {
      return;
    }

    const g = window.google.maps;

    try {
      const providerPos = { lat: provLat, lng: provLng };

      // Initialize map instance once
      if (!mapRef.current) {
        mapRef.current = new g.Map(containerRef.current, {
          center: providerPos,
          zoom: 14,
          mapTypeId: currentMapType,
          styles: currentMapType === 'roadmap' ? GOOGLE_MAPS_DARK_STYLE : null,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
        });
      } else {
        mapRef.current.setMapTypeId(currentMapType);
        if (currentMapType === 'roadmap') {
          mapRef.current.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
        } else {
          mapRef.current.setOptions({ styles: null });
        }
      }

      const map = mapRef.current;

      // Ensure proper render dimensions
      if (g.event?.trigger) {
        g.event.trigger(map, 'resize');
      }

      // 1. Provider Marker (Radar Beacon / Technician)
      if (!providerMarkerRef.current) {
        providerMarkerRef.current = new g.Marker({
          position: providerPos,
          map,
          title: `${providerName} (En Route)`,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5,
          },
        });

        const infoWindow = new g.InfoWindow({
          content: `
            <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
              <strong style="font-size: 13px;">${providerName}</strong>
              <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">Verified Technician En Route</p>
            </div>
          `,
        });

        providerMarkerRef.current.addListener('click', () => {
          infoWindow.open(map, providerMarkerRef.current);
        });
      } else {
        providerMarkerRef.current.setPosition(providerPos);
      }

      // 2. Customer Marker & Route
      if (customerLocation && isLocationShared && hasValidCustCoords) {
        const customerPos = { lat: custLat, lng: custLng };

        if (!customerMarkerRef.current) {
          customerMarkerRef.current = new g.Marker({
            position: customerPos,
            map,
            title: 'Your Location (Destination)',
            icon: {
              path: g.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#38bdf8',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        } else {
          customerMarkerRef.current.setPosition(customerPos);
          customerMarkerRef.current.setMap(map);
        }

        // Accuracy Circle
        if (!customerCircleRef.current) {
          customerCircleRef.current = new g.Circle({
            strokeColor: '#38bdf8',
            strokeOpacity: 0.6,
            strokeWeight: 1.5,
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            map,
            center: customerPos,
            radius: 80,
          });
        } else {
          customerCircleRef.current.setCenter(customerPos);
          customerCircleRef.current.setMap(map);
        }

        // Connecting Polyline
        const pathCoords = [providerPos, customerPos];
        if (!routeLineRef.current) {
          routeLineRef.current = new g.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: '#22c55e',
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map,
          });
        } else {
          routeLineRef.current.setPath(pathCoords);
          routeLineRef.current.setMap(map);
        }

        // Fit Bounds
        try {
          const bounds = new g.LatLngBounds();
          bounds.extend(providerPos);
          bounds.extend(customerPos);
          map.fitBounds(bounds, 50);
        } catch (_) {
          map.panTo(providerPos);
        }
      } else {
        // Clear customer elements if location revoked
        if (customerMarkerRef.current) customerMarkerRef.current.setMap(null);
        if (customerCircleRef.current) customerCircleRef.current.setMap(null);
        if (routeLineRef.current) routeLineRef.current.setMap(null);
        map.panTo(providerPos);
      }
    } catch (err) {
      console.warn('[GoogleMapsCanvas] Error during map rendering, activating fallback:', err);
      setLoadFailed(true);
      if (onFallback) onFallback();
    }
  }, [
    isLoaded,
    loadFailed,
    currentMapType,
    provLat,
    provLng,
    hasValidProvCoords,
    custLat,
    custLng,
    hasValidCustCoords,
    isLocationShared,
    providerName,
    onFallback
  ]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (providerMarkerRef.current) providerMarkerRef.current.setMap(null);
      if (customerMarkerRef.current) customerMarkerRef.current.setMap(null);
      if (customerCircleRef.current) customerCircleRef.current.setMap(null);
      if (routeLineRef.current) routeLineRef.current.setMap(null);
      mapRef.current = null;
    };
  }, []);

  // Graceful Fallback UI strictly conforming to Requirement 3
  if (loadFailed || !hasValidProvCoords) {
    return (
      <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-300 p-6 text-center space-y-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-white">
          Map is currently unavailable. Please check the location manually.
        </p>
        <p className="text-xs text-slate-400 max-w-md">
          {providerName} is actively en route. Coordinates:{' '}
          <span className="font-mono text-slate-300">
            {hasValidProvCoords ? `${provLat.toFixed(4)}, ${provLng.toFixed(4)}` : 'Coordinates Pending'}
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {onFallback && (
            <button
              type="button"
              onClick={onFallback}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to Vector Radar Map</span>
            </button>
          )}
          {hasValidProvCoords && (
            <a
              href={getGoogleMapsNavigationUrl(provLat, provLng, hasValidCustCoords ? custLat : null, hasValidCustCoords ? custLng : null)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Native Google Maps</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map DOM Canvas */}
      <div ref={containerRef} className={className} />

      {/* Map Type Switcher */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        <button
          type="button"
          onClick={() => setCurrentMapType('roadmap')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            currentMapType === 'roadmap'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Google Dark
        </button>
        <button
          type="button"
          onClick={() => setCurrentMapType('satellite')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition ${
            currentMapType === 'satellite'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}

export default GoogleMapsCanvas;
