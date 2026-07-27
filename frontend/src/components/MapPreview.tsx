import React, { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  location: string;
}

const MapPreview: React.FC<MapPreviewProps> = ({ location }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Helper to load external styles/scripts dynamically
    const loadLeaflet = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if ((window as any).L) {
          resolve((window as any).L);
          return;
        }

        // Add stylesheet
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Add script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          resolve((window as any).L);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Leaflet script'));
        };
        document.body.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Lat/Lng from Nominatim OpenStreetMap API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            location
          )}&format=json&limit=1`
        );
        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();
        let lat = 9.9312; // default: Kochi
        let lon = 76.2673;

        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
        }

        // 2. Load Leaflet library
        const L = await loadLeaflet();

        if (!isMounted) return;

        // 3. Destroy previous map instance if it exists
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        if (!mapContainerRef.current) return;

        // 4. Initialize Map
        const map = L.map(mapContainerRef.current).setView([lat, lon], 14);
        mapRef.current = map;

        // 5. Add OSM Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // 6. Custom icon wrapper to avoid Leaflet default icon path resolving issues in bundler
        const defaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        // 7. Add Marker
        L.marker([lat, lon], { icon: defaultIcon })
          .addTo(map)
          .bindPopup(`<b>Gig Location</b><br/>${location}`)
          .openPopup();

        setLoading(false);
      } catch (err: unknown) {
        console.error('Error loading map:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not load map');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location]);

  return (
    <div className="relative w-full h-48 border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Locating Gig...</span>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-rose-50/50">
          <span className="text-xs font-bold text-rose-600">Failed to render interactive map</span>
          <span className="text-[10px] text-secondary mt-1 max-w-[200px] truncate">{location}</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};

export default MapPreview;
