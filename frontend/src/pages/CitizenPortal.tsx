import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertOctagon,
  ShieldAlert,
  MapPin,
  Radio,
  ExternalLink,
  Users,
  Home,
  Package,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { apiService } from '../services/api';
import {
  Incident,
  EmergencyAlert,
  Shelter,
  SeverityLevel,
  DashboardStats,
  RegionalScenarioId,
  Language,
} from '../types';
import { MapView } from '../components/MapView';
import { translations } from '../services/i18n';

interface CitizenPortalProps {
  onOpenSOS: () => void;
  onOpenReport: () => void;
  currentScenario: RegionalScenarioId;
  onScenarioChange: (scenarioId: RegionalScenarioId) => void;
  language: Language;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onOpenSOS,
  onOpenReport,
  currentScenario,
  onScenarioChange,
  language,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');

  const t = translations[language] || translations.en;
  const activeScenario = apiService.getActiveScenario();

  const loadData = async () => {
    try {
      const [incList, alertList, shelterList, statsData] = await Promise.all([
        apiService.getIncidents(),
        apiService.getAlerts(),
        apiService.getShelters(),
        apiService.getDashboardStats(),
      ]);
      setIncidents(incList);
      setAlerts(alertList);
      setShelters(shelterList);
      setStats(statsData);
      if (!selectedIncident && incList.length > 0) {
        setSelectedIncident(incList[0]);
      }
    } catch (e) {
      console.error('Failed to load portal data:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [currentScenario]);

  // Format date in Asia/Kolkata
  const formatIST = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const filteredIncidents = incidents
    .filter((i) => {
      if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
      if (severityFilter !== 'All' && i.severity !== severityFilter) return false;
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = i.title.toLowerCase().includes(q);
        const matchesLoc = i.locationName.toLowerCase().includes(q);
        const matchesId = i.incidentId.toLowerCase().includes(q);
        return matchesTitle || matchesLoc || matchesId;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const order: Record<SeverityLevel, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Reported':
        return 'bg-slate-700 text-slate-300';
      case 'Under Verification':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'Verified':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      case 'Response Assigned':
      case 'In Progress':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const currentAlert = alerts.length > 0 && alerts[0].active ? alerts[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Active Disaster Broadcast Alert Banner */}
      {currentAlert && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-red-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse" />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-red-600/30 border border-red-500/50 rounded-xl text-red-400 mt-1 shrink-0">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                    {currentAlert.severity} WARNING
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Source: {currentAlert.sourceType}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>IST {formatIST(currentAlert.issuedAt)}</span>
                  </span>
                  {currentAlert.isDemo && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-400/40">
                      SIMULATED SCENARIO
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                  {currentAlert.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
                  {currentAlert.instructions}
                </p>

                {currentAlert.recommendedActions && currentAlert.recommendedActions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      Recommended Directives:
                    </span>
                    <ul className="mt-1 list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {currentAlert.recommendedActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-semibold">Affected Corridors:</span>
                  <span className="text-white font-medium">{currentAlert.affectedRegions.join(' • ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Summary Cards (Zero hardcoded numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Active Incidents */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{t.cardActiveIncidents}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats?.activeIncidents ?? incidents.filter((i) => i.status !== 'Resolved').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">in active scenario</span>
        </div>

        {/* Critical Attention */}
        <div className="bg-slate-800/80 border border-red-500/30 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-red-300">{t.cardCriticalHazards}</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-400">
            {stats?.criticalIncidents ?? incidents.filter((i) => i.severity === 'Critical').length}
          </div>
          <span className="text-[10px] text-red-300/80 mt-1">High priority</span>
        </div>

        {/* People Affected */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{t.cardPeopleAffected}</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats?.peopleAffectedCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">reported at risk</span>
        </div>

        {/* Available Shelter Capacity */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{t.cardShelterCapacity}</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {stats?.shelterAvailableSlots ?? 0}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {stats?.shelterCapacityTotal ?? 0}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">open bed capacity</span>
        </div>

        {/* Relief Stock Alerts */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{t.cardStockAlerts}</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {stats?.lowStockItemsCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">critical supplies low</span>
        </div>

        {/* Response Teams Deployed */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{t.cardTeamsDeployed}</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats?.teamsDispatched ?? 0}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {stats?.totalTeams ?? 4}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">active in field</span>
        </div>
      </div>

      {/* Hero Action & Scenario Context Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Active Scenario: {activeScenario.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeScenario.hazardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeScenario.scenarioDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={onOpenSOS}
            className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/40 animate-sos transition flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 animate-spin" />
            <span>{t.sendSOS}</span>
          </button>
          <button
            onClick={onOpenReport}
            className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{t.reportIncident}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Disaster Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{t.geoVisualization}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredIncidents.length} Hazards • {shelters.length} Shelters
            </span>
          </div>

          <MapView
            incidents={filteredIncidents}
            shelters={shelters}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            center={activeScenario.center}
            zoom={activeScenario.zoom}
            className="h-[440px] sm:h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            sourceAttribution={`${activeScenario.name} • Live Coordinates`}
          />

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span>Map Legend:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-4" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 text-[9px] font-bold text-white flex items-center justify-center">
                  H
                </span>
                <span>Relief Shelter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Incidents Stream with Search & Filters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{t.incidentsFeed}</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'severity' : 'date')}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
              >
                Sort: {sortBy === 'date' ? 'Time' : 'Severity'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-3 gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 px-2 py-1.5"
            >
              <option value="All">{t.allDisasters}</option>
              <option value="Flood">Flood</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Landslide">Landslide</option>
              <option value="Building Collapse">Collapse</option>
              <option value="Fire">Fire</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 px-2 py-1.5"
            >
              <option value="All">{t.allSeverities}</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 px-2 py-1.5"
            >
              <option value="All">{t.allStatuses}</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Cards Stream */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-xs">
                No incidents match current filter criteria.
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = selectedIncident?.incidentId === incident.incidentId;
                return (
                  <div
                    key={incident.incidentId}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-red-500/70 shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          {incident.incidentId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          • {incident.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-white mb-1 leading-snug">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                      {incident.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{incident.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                    </div>

                    {incident.assignedTeamName && (
                      <div className="mt-2 pt-1.5 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Assigned Team:</span>
                        <span className="text-blue-300 font-semibold">{incident.assignedTeamName}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Official Disaster Safety & Preparedness Directives (Localized via language) */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>{t.safetyTitle}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t.safetySubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          {/* Flood / Waterlogging */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-red-400 flex items-center gap-1.5">
              <span>{t.floodSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.floodSafetyDesc}</p>
          </div>

          {/* Cyclone / Coastal */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>{t.cycloneSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.cycloneSafetyDesc}</p>
          </div>

          {/* Landslide / Flash Flood */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
              <span>{t.landslideSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.landslideSafetyDesc}</p>
          </div>

          {/* Heatwave */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
              <span>{t.heatwaveSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.heatwaveSafetyDesc}</p>
          </div>

          {/* Fire & Hazmat */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
              <span>{t.fireSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.fireSafetyDesc}</p>
          </div>

          {/* Earthquake */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>{t.earthquakeSafetyTitle}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">{t.earthquakeSafetyDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
