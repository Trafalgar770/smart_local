import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GoogleMapsCanvas } from './GoogleMapsCanvas';
import { getGoogleMapsNavigationUrl } from '../utils/googleMapsLoader';
import {
  Navigation,
  MapPin,
  Clock,
  ShieldOff,
  Radio,
  Play,
  RotateCcw,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LiveTrackingMapProps {
  providerLocation: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number } | null;
  providerName: string;
  etaMinutes: number;
  distanceKm: number;
  isLocationShared: boolean;
  onRevokeLocation: () => void;
  onSimulateStep?: () => void;
  isSimulating?: boolean;
}

export function LiveTrackingMap({
  providerLocation,
  customerLocation,
  providerName,
  etaMinutes,
  distanceKm,
  isLocationShared,
  onRevokeLocation,
  onSimulateStep,
  isSimulating = false,
}: LiveTrackingMapProps) {
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const providerMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [providerLocation.latitude, providerLocation.longitude],
        zoom: 14,
        zoomControl: true,
      });

      // Dark theme map tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Provider Marker (Green Pulsing Beacon)
    const providerIcon = L.divIcon({
      className: 'provider-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(34, 197, 94, 0.35); border-radius: 50%; animation: radar-ping 2s infinite;"></div>
          <div style="width: 20px; height: 20px; background: #22c55e; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (!providerMarkerRef.current) {
      providerMarkerRef.current = L.marker(
        [providerLocation.latitude, providerLocation.longitude],
        { icon: providerIcon }
      )
        .addTo(map)
        .bindPopup(`<b>${providerName}</b><br/>En route`);
    } else {
      providerMarkerRef.current.setLatLng([
        providerLocation.latitude,
        providerLocation.longitude,
      ]);
    }

    // Customer Marker (Blue Pin)
    if (customerLocation && isLocationShared) {
      const customerIcon = L.divIcon({
        className: 'customer-leaflet-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center;">
            <div style="width: 22px; height: 22px; background: #3b82f6; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (!customerMarkerRef.current) {
        customerMarkerRef.current = L.marker(
          [customerLocation.latitude, customerLocation.longitude],
          { icon: customerIcon }
        )
          .addTo(map)
          .bindPopup('<b>Your Location</b><br/>Breakdown Destination');
      } else {
        customerMarkerRef.current.setLatLng([
          customerLocation.latitude,
          customerLocation.longitude,
        ]);
      }

      // Draw routing vector line
      const latlngs: [number, number][] = [
        [providerLocation.latitude, providerLocation.longitude],
        [customerLocation.latitude, customerLocation.longitude],
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#22c55e',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(latlngs);
      }

      // Fit bounds to show both
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      // Remove customer marker & line if sharing revoked
      if (customerMarkerRef.current) {
        map.removeLayer(customerMarkerRef.current);
        customerMarkerRef.current = null;
      }
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
      map.panTo([providerLocation.latitude, providerLocation.longitude]);
    }
  }, [providerLocation, customerLocation, isLocationShared, providerName]);

  useEffect(() => {
    if (mapEngine === 'leaflet' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
    }
  }, [mapEngine]);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* HUD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Live Provider Radar & Tracking
            </h3>
            <p className="text-xs text-slate-400">
              {providerName} is navigating to your destination
            </p>
          </div>
        </div>

        {/* Engine switcher & Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Map Engine Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              id="toggle-engine-google"
              onClick={() => setMapEngine('google')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                mapEngine === 'google'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              type="button"
              id="toggle-engine-leaflet"
              onClick={() => setMapEngine('leaflet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                mapEngine === 'leaflet'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Vector Radar</span>
            </button>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{etaMinutes} min</span>
              <span className="text-slate-500 font-normal">ETA</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Navigation className="w-3.5 h-3.5 text-brand-400" />
              <span>{distanceKm} km</span>
              <span className="text-slate-500 font-normal">remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner h-72 md:h-96">
        {/* Google Maps Canvas */}
        <div className={`w-full h-full ${mapEngine === 'google' ? 'block' : 'hidden'}`}>
          <GoogleMapsCanvas
            providerLocation={providerLocation}
            customerLocation={customerLocation}
            providerName={providerName}
            isLocationShared={isLocationShared}
            onFallback={() => setMapEngine('leaflet')}
          />
        </div>

        {/* Leaflet Vector Radar Canvas */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full z-10 ${mapEngine === 'leaflet' ? 'block' : 'hidden'}`}
        />

        {/* Location sharing badge overlay */}
        <div className="absolute top-3 left-3 z-20">
          {isLocationShared ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Location Shared (Encrypted)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
              <ShieldOff className="w-3.5 h-3.5" />
              <span>Location Revoked (Private)</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Instant Stop Location Sharing Invariant */}
          {isLocationShared ? (
            <button
              type="button"
              id="stop-location-sharing-btn"
              onClick={onRevokeLocation}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white text-xs font-bold transition shadow-lg shadow-red-950/30"
            >
              <ShieldOff className="w-4 h-4 text-red-400" />
              <span>Stop Sharing Location (Revoke)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Location stream revoked. Coordinates are not exposed to technician.
            </span>
          )}

          {/* Turn-by-Turn GPS Google Maps Link */}
          <a
            href={getGoogleMapsNavigationUrl(
              providerLocation.latitude,
              providerLocation.longitude,
              customerLocation?.latitude,
              customerLocation?.longitude
            )}
            target="_blank"
            rel="noopener noreferrer"
            id="google-maps-gps-link"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-brand-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Open in Google Maps GPS</span>
          </a>
        </div>

        {/* Demo Simulation Trigger */}
        {onSimulateStep && (
          <button
            type="button"
            id="simulate-tracking-step-btn"
            onClick={onSimulateStep}
            disabled={isSimulating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Transit...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-brand-400" />
                <span>Advance Demo Movement (+12%)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default LiveTrackingMap;
