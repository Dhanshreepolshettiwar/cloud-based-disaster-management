import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, Shelter } from '../types';

interface MapViewProps {
  incidents: Incident[];
  shelters?: Shelter[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  shelters = [],
  selectedIncident,
  onSelectIncident,
  className = 'h-96 w-full rounded-xl overflow-hidden shadow-lg border border-slate-700',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (e.g. 19.0760, 72.8777)
    const map = L.map(mapContainerRef.current, {
      center: [19.08, 72.88],
      zoom: 12,
      zoomControl: true,
    });

    // Dark styled tile layer via CartoDB Dark Matter / OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const bounds: L.LatLngTuple[] = [];

    // Render Incidents Markers
    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const latLng: L.LatLngTuple = [inc.latitude, inc.longitude];
      bounds.push(latLng);

      const color =
        inc.severity === 'Critical'
          ? '#DC2626'
          : inc.severity === 'High'
          ? '#EA580C'
          : inc.severity === 'Medium'
          ? '#D97706'
          : '#2563EB';

      const customIcon = L.divIcon({
        className: 'custom-disaster-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            cursor: pointer;
            animation: ${inc.severity === 'Critical' ? 'sos-radar 2s infinite' : 'none'};
          ">
            <span style="color: white; font-size: 11px; font-weight: bold;">!</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 200px; color: #1e293b;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${color};">
            ${inc.category} • ${inc.severity} Severity
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">
            ${inc.title}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
            📍 ${inc.locationName}
          </div>
          <div style="display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e2e8f0; color: #334155;">
            Status: ${inc.status}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Render Shelters Markers
    shelters.forEach((shelter) => {
      if (!shelter.latitude || !shelter.longitude) return;

      const latLng: L.LatLngTuple = [shelter.latitude, shelter.longitude];
      bounds.push(latLng);

      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="
            background-color: #10B981;
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          ">
            <span style="color: white; font-size: 12px;">🏠</span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker(latLng, { icon: shelterIcon });
      const popup = `
        <div style="font-family: sans-serif; min-width: 180px; color: #1e293b;">
          <div style="font-size: 11px; font-weight: bold; color: #10b981;">EMERGENCY SHELTER</div>
          <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">${shelter.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${shelter.address}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            Occupancy: <strong>${shelter.currentOccupancy} / ${shelter.capacity}</strong>
          </div>
        </div>
      `;
      marker.bindPopup(popup);
      markersLayerRef.current?.addLayer(marker);
    });

    // Fit bounds if markers exist
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [incidents, shelters, onSelectIncident]);

  // Center on selected incident
  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current && selectedIncident.latitude && selectedIncident.longitude) {
      mapInstanceRef.current.setView([selectedIncident.latitude, selectedIncident.longitude], 15, {
        animate: true,
      });
    }
  }, [selectedIncident]);

  return <div ref={mapContainerRef} className={className} />;
};
