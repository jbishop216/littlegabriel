'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BiblicalLocation, LocationType, getLocationsByChapter } from '@/lib/services/bibleLocationService';

// Fix for Leaflet default icons in Next.js
const fixLeafletIcons = () => {
  // This needs to be inside a useEffect hook to avoid SSR issues
  // @ts-ignore - _getIconUrl is a private property that does exist
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Color mapping for different location types
const locationColors: Record<LocationType, string> = {
  [LocationType.CITY]: '#1E40AF',     // Blue
  [LocationType.REGION]: '#047857',   // Green
  [LocationType.COUNTRY]: '#B91C1C',  // Red
  [LocationType.LANDMARK]: '#6D28D9', // Purple
  [LocationType.WATER]: '#0284C7',    // Light Blue
  [LocationType.MOUNTAIN]: '#92400E', // Brown
  [LocationType.OTHER]: '#71717A',    // Gray
};

interface BibleMapProps {
  chapterId: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function BibleMap({ 
  chapterId, 
  width = '100%', 
  height = '400px',
  className = ''
}: BibleMapProps) {
  const [locations, setLocations] = useState<BiblicalLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.7683, 35.2137]); // Default to Jerusalem
  const [zoom, setZoom] = useState(7);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the map renders only on the client-side
    setIsClient(true);
    
    // Fix Leaflet icons
    fixLeafletIcons();
    
    // Get relevant locations for this chapter
    const chapterLocations = getLocationsByChapter(chapterId);
    setLocations(chapterLocations);
    
    // If we have locations, center the map on the most important one
    if (chapterLocations.length > 0) {
      // Sort by importance (descending)
      const sortedByImportance = [...chapterLocations].sort((a, b) => b.importance - a.importance);
      const mostImportant = sortedByImportance[0];
      setMapCenter([mostImportant.latitude, mostImportant.longitude]);
      
      // Adjust zoom based on how many locations we need to show
      if (chapterLocations.length > 10) {
        setZoom(6); // Zoom out for many locations
      } else if (chapterLocations.length > 5) {
        setZoom(7); // Medium zoom for several locations
      } else {
        setZoom(8); // Closer zoom for few locations
      }
    }
  }, [chapterId]);

  // Don't render the map on the server
  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 ${className}`}
        style={{ width, height }}
      >
        Loading map...
      </div>
    );
  }

  // If no locations found for this chapter
  if (locations.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 ${className}`}
        style={{ width, height }}
      >
        No location data available for this chapter
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <div style={{ position: 'relative', height: '100%' }}>
        {/* @ts-ignore - types issue with react-leaflet */}
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          scrollWheelZoom={false}
        >
          {/* @ts-ignore - types issue with react-leaflet */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {locations.map((location) => (
            // @ts-ignore - types issue with react-leaflet
            <CircleMarker
              key={location.id}
              center={[location.latitude, location.longitude]}
              radius={Math.min(10, Math.max(5, location.importance))}
              pathOptions={{ 
                fillColor: locationColors[location.type], 
                color: '#fff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  <p className="text-sm text-gray-700">{location.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Map Legend */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '10px', 
            right: '10px', 
            backgroundColor: 'white', 
            padding: '8px', 
            borderRadius: '4px',
            boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '12px'
          }}
        >
          <div className="text-xs font-semibold mb-1">Map Legend</div>
          {Object.entries(locationColors).map(([type, color]) => (
            <div key={type} className="flex items-center mb-1 last:mb-0">
              <div 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: color, 
                  borderRadius: '50%',
                  marginRight: '4px'
                }} 
              />
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}