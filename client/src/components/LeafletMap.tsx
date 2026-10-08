import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Play, Pause, RotateCcw, FastForward, Shield, Navigation, ExternalLink, Map as MapIcon } from 'lucide-react';
import { GoogleMapsCanvas } from './GoogleMapsCanvas';
import { getGoogleMapsNavigationUrl } from '../utils/googleMapsLoader';

interface LeafletMapProps {
  customerCoords: { lat: number; lng: number; label?: string };
  providerCoords: { lat: number; lng: number; label?: string };
  onProviderMove?: (coords: { lat: number; lng: number }, progress: number) => void;
  isSimulated?: boolean;
  status?: string;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  customerCoords,
  providerCoords,
  onProviderMove,
  isSimulated = true,
  status = 'on_the_way',
  className = 'h-96 w-full',
}) => {
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const providerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Simulation state
  const [progress, setProgress] = useState<number>(30); // 0% to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animIntervalRef = useRef<any>(null);

  // Calculate current interpolated position of provider based on progress
  const currentProviderLat = providerCoords.lat + (customerCoords.lat - providerCoords.lat) * (progress / 100);
  const currentProviderLng = providerCoords.lng + (customerCoords.lng - providerCoords.lng) * (progress / 100);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered between customer and provider
      const centerLat = (customerCoords.lat + providerCoords.lat) / 2;
      const centerLng = (customerCoords.lng + providerCoords.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
      });

      // Dark mode map tiles from CartoDB or OpenStreetMap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing customer icon
      const customerIcon = L.divIcon({
        className: 'custom-customer-icon',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(34, 197, 94, 0.4); border-radius: 50%; animation: radar-ping 1.8s infinite;"></div>
            <div style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; background: #16a34a; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Custom vehicle provider icon
      const providerIcon = L.divIcon({
        className: 'custom-provider-icon',
        html: `
          <div style="width: 36px; height: 36px; background: #0f172a; border: 2px solid #38bdf8; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); font-size: 18px;">
            🚗
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const custMarker = L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<strong>📍 Customer Location:</strong><br>${customerCoords.label || 'Customer'} (Temporary Active Share)`);

      const provMarker = L.marker([currentProviderLat, currentProviderLng], { icon: providerIcon })
        .addTo(map)
        .bindPopup(`<strong>🛠️ Provider Vehicle:</strong><br>${providerCoords.label || 'Technician / Mechanic'}`);

      // Route Polyline
      const line = L.polyline(
        [
          [currentProviderLat, currentProviderLng],
          [customerCoords.lat, customerCoords.lng],
        ],
        {
          color: '#38bdf8',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      customerMarkerRef.current = custMarker;
      providerMarkerRef.current = provMarker;
      polylineRef.current = line;

      // Fit bounds
      const bounds = L.latLngBounds([
        [customerCoords.lat, customerCoords.lng],
        [providerCoords.lat, providerCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position on progress change
  useEffect(() => {
    if (providerMarkerRef.current && polylineRef.current) {
      providerMarkerRef.current.setLatLng([currentProviderLat, currentProviderLng]);
      polylineRef.current.setLatLngs([
        [currentProviderLat, currentProviderLng],
        [customerCoords.lat, customerCoords.lng],
      ]);
      if (onProviderMove) {
        onProviderMove({ lat: currentProviderLat, lng: currentProviderLng }, progress);
      }
    }
  }, [progress, currentProviderLat, currentProviderLng]);

  // Handle Play/Pause simulation
  useEffect(() => {
    if (isPlaying) {
      animIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 2.5);
        });
      }, 700);
    } else {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    }
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (mapEngine === 'leaflet' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
    }
  }, [mapEngine]);

  const handleStepForward = () => {
    setProgress(prev => Math.min(100, prev + 15));
  };

  const handleReset = () => {
    setProgress(15);
    setIsPlaying(false);
  };

  const remainingDist = Math.max(0.1, ((100 - progress) / 100) * 2.8).toFixed(1);
  const remainingEta = Math.max(1, Math.round(((100 - progress) / 100) * 12));

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
      {/* Simulation Badge */}
      {isSimulated && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping"></span>
          <span>DEMO SIMULATION TRACKING</span>
        </div>
      )}

      {/* Engine Switcher + ETA HUD Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-2">
        {/* Map Engine Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1 rounded-xl text-xs shadow-lg">
          <button
            type="button"
            id="leaflet-toggle-google"
            onClick={() => setMapEngine('google')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              mapEngine === 'google'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Google Maps</span>
          </button>
          <button
            type="button"
            id="leaflet-toggle-vector"
            onClick={() => setMapEngine('leaflet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
              mapEngine === 'leaflet'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Vector Radar</span>
          </button>
        </div>

        {/* ETA Telemetry */}
        <div className="glass-panel px-3 py-2 rounded-xl border border-slate-700 text-xs shadow-lg flex items-center space-x-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Distance</p>
            <p className="font-extrabold text-white text-sm">
              {progress >= 98 ? 'Arrived!' : `${remainingDist} km`}
            </p>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Est. Arrival</p>
            <p className="font-extrabold text-emerald-400 text-sm">
              {progress >= 98 ? 'On Spot' : `${remainingEta} mins`}
            </p>
          </div>
        </div>
      </div>

      {/* Google Maps Canvas */}
      <div className={`w-full h-full ${mapEngine === 'google' ? 'block' : 'hidden'}`}>
        <GoogleMapsCanvas
          providerLocation={{ latitude: currentProviderLat, longitude: currentProviderLng }}
          customerLocation={{ latitude: customerCoords.lat, longitude: customerCoords.lng }}
          providerName={providerCoords.label || 'Technician / Mechanic'}
          isLocationShared={true}
          className={className}
          onFallback={() => setMapEngine('leaflet')}
        />
      </div>

      {/* Leaflet DOM Node */}
      <div
        ref={mapContainerRef}
        className={`${className} ${mapEngine === 'leaflet' ? 'block' : 'hidden'}`}
      />

      {/* Demo Simulation Controls Footer */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">
            Technician Route: <strong className="text-slate-200">{progress}% covered</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Turn-by-Turn GPS Google Maps Link */}
          <a
            href={getGoogleMapsNavigationUrl(
              currentProviderLat,
              currentProviderLng,
              customerCoords.lat,
              customerCoords.lng
            )}
            target="_blank"
            rel="noopener noreferrer"
            id="provider-google-maps-gps-link"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 transition"
            title="Open turn-by-turn route in native Google Maps"
          >
            <ExternalLink className="w-3 h-3 text-sky-400" />
            <span>Google Maps GPS</span>
          </a>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition ${
              isPlaying
                ? 'bg-amber-600/80 text-white hover:bg-amber-500'
                : 'bg-brand-600/80 text-white hover:bg-brand-500'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause Sim' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleStepForward}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Move provider vehicle 15% closer"
          >
            <FastForward className="w-3 h-3" />
            <span>Step +15%</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset to origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
