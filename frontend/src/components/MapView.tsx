import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, Shelter } from '../types';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface MapViewProps {
  incidents: Incident[];
  shelters?: Shelter[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  sourceAttribution?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  shelters = [],
  selectedIncident,
  onSelectIncident,
  center = [19.076, 72.8777],
  zoom = 12,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700',
  sourceAttribution = 'Attributed to IMD / State Disaster Operations & Simulated Local Scenarios',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

  // Update center when scenario changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Render Incidents Markers
    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const latLng: L.LatLngTuple = [inc.latitude, inc.longitude];
      const isSelected = selectedIncident?.incidentId === inc.incidentId;

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
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            border: ${isSelected ? '3px solid #FDE047' : '2.5px solid #FFFFFF'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            cursor: pointer;
            transition: transform 0.2s;
            animation: ${inc.severity === 'Critical' ? 'sos-radar 2s infinite' : 'none'};
          ">
            <span style="color: white; font-size: 11px; font-weight: 900;">!</span>
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0F172A; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
              ${inc.category} • ${inc.district || ''}
            </span>
            <span style="background-color: ${color}20; color: ${color}; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">
              ${inc.severity}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 800; margin-bottom: 4px; color: #0F172A;">
            ${inc.title}
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px; line-height: 1.3;">
            ${inc.locationName}
          </div>
          <div style="font-size: 10px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
            <span>Status: <strong>${inc.status}</strong></span>
            <span>Affected: <strong>${inc.peopleAffected || 'N/A'}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(inc);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Render Shelters Markers
    shelters.forEach((shelter) => {
      if (!shelter.latitude || !shelter.longitude) return;

      const latLng: L.LatLngTuple = [shelter.latitude, shelter.longitude];
      const isFull = shelter.status === 'Full';
      const bgColor = isFull ? '#64748B' : '#059669';

      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            cursor: pointer;
          ">
            <span style="color: white; font-size: 11px; font-weight: bold;">H</span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker(latLng, { icon: shelterIcon });

      const available = Math.max(0, shelter.capacity - shelter.currentOccupancy);
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0F172A; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #059669;">
              RELIEF SHELTER
            </span>
            <span style="background-color: ${isFull ? '#E2E8F0' : '#D1FAE5'}; color: ${isFull ? '#475569' : '#047857'}; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px;">
              ${shelter.status}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 800; margin-bottom: 2px; color: #0F172A;">
            ${shelter.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${shelter.address}
          </div>
          <div style="font-size: 10px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
            <span>Occupancy: <strong>${shelter.currentOccupancy}/${shelter.capacity}</strong></span>
            <span style="color: ${available > 0 ? '#059669' : '#DC2626'}; font-weight: 700;">
              ${available} Beds Free
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
    });
  }, [incidents, shelters, selectedIncident]);

  // Center on selected incident if clicked
  useEffect(() => {
    if (selectedIncident?.latitude && selectedIncident?.longitude && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedIncident.latitude, selectedIncident.longitude],
        14,
        { duration: 1.2 }
      );
    }
  }, [selectedIncident]);

  return (
    <div className={`relative ${className}`}>
      {/* Persistent Demo Warning Watermark Badge */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-extrabold text-[10px] tracking-wide shadow-lg backdrop-blur-sm pointer-events-none border border-amber-300">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>DEMO DATA — NOT LIVE EMERGENCY INFORMATION</span>
      </div>

      {/* Attribution footer bar */}
      <div className="absolute bottom-2 right-2 z-[400] hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/80 text-slate-300 text-[10px] backdrop-blur-sm border border-slate-700/80 pointer-events-none">
        <ShieldAlert className="w-3 h-3 text-emerald-400" />
        <span>{sourceAttribution}</span>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
