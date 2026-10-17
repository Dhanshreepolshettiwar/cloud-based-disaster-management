import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertOctagon,
  ShieldAlert,
  MapPin,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { apiService } from '../services/api';
import { Incident, EmergencyAlert, Shelter, SeverityLevel } from '../types';
import { MapView } from '../components/MapView';

interface CitizenPortalProps {
  onOpenSOS: () => void;
  onOpenReport: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ onOpenSOS, onOpenReport }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const loadData = async () => {
    try {
      const [incList, alertList, shelterList] = await Promise.all([
        apiService.getIncidents(),
        apiService.getAlerts(),
        apiService.getShelters(),
      ]);
      setIncidents(incList);
      setAlerts(alertList);
      setShelters(shelterList);
    } catch (e) {
      console.error('Failed to load portal data:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = incidents.filter((i) => {
    if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
    if (severityFilter !== 'All' && i.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Active Broadcast Alert Banner */}
      {alerts.length > 0 && alerts[0].active && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border border-red-500/50 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-red-600/30 border border-red-500/40 rounded-xl text-red-400 mt-0.5">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                  URGENT BROADCAST
                </span>
                <span className="text-xs text-red-300">
                  Issued by {alerts[0].issuedBy} • {new Date(alerts[0].issuedAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">{alerts[0].title}</h2>
              <p className="text-sm text-red-200 mt-1 leading-relaxed">{alerts[0].instructions}</p>
              <div className="mt-2 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <span>Affected Areas:</span>
                <span className="text-white">{alerts[0].affectedRegions.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Action Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            Live Cloud Disaster Command & Emergency Response
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central Disaster Reporting & Response Platform
          </h1>
          <p className="text-sm text-slate-300">
            Submit instant SOS beacons for life-saving assistance, report localized disaster hazards, track response teams, and find verified emergency shelters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenSOS}
            className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/40 animate-sos transition"
          >
            SEND SOS DISTRESS
          </button>
          <button
            onClick={onOpenReport}
            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-sm transition"
          >
            Report Incident
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Disaster Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Live Disaster Geo-Visualization
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredIncidents.length} incidents & {shelters.length} shelters
            </span>
          </div>

          <MapView
            incidents={filteredIncidents}
            shelters={shelters}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            className="h-[460px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
          />

          {/* Map Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="font-semibold text-slate-300">Map Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Shelter</span>
            </div>
          </div>
        </div>

        {/* Right Column: Incidents Stream with Filters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Active Incidents Feed
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1"
              >
                <option value="All">All Disasters</option>
                <option value="Flood">Flood</option>
                <option value="Fire">Fire</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Cyclone">Cyclone</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400">
                No incidents match current filter criteria.
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = selectedIncident?.incidentId === incident.incidentId;
                return (
                  <div
                    key={incident.incidentId}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-red-500/60 shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {incident.category}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">{incident.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">{incident.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{incident.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                          {incident.status}
                        </span>
                      </div>
                    </div>

                    {incident.mediaUrls && incident.mediaUrls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-2 text-xs text-amber-400 font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>1 photo attachment uploaded to S3</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Safety Protocols & Guidelines Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          Disaster Preparedness & Safety Directives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-red-400 mb-1.5">Flood Evacuation</h4>
            <p>
              Disconnect main electrical power switches. Never walk or drive through flowing water. Move essential documents and elderly family members to elevated floors immediately.
            </p>
          </div>
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-amber-400 mb-1.5">Fire Safety & Hazmat</h4>
            <p>
              Stay low beneath smoke layers using damp cloths. Do not use elevators. If industrial chemicals are reported, evacuate perpendicular to the wind direction.
            </p>
          </div>
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-blue-400 mb-1.5">Earthquake Response</h4>
            <p>
              Drop, Cover, and Hold On beneath sturdy furniture. Stay away from glass facades and masonry walls. Once shaking stops, move calmly to open designated muster grounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
