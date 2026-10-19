import React, { useState, useEffect } from 'react';
import {
  Radio,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
  Users,
  ShieldCheck,
  Building,
  Clock,
  MapPin,
  XCircle,
  Copy,
} from 'lucide-react';
import { apiService } from '../services/api';
import {
  Incident,
  SOSRequest,
  RescueTeam,
  DashboardStats,
  IncidentStatus,
  SeverityLevel,
  AlertSourceType,
  DisasterCategory,
} from '../types';
import { useAuth } from '../context/AuthContext';

export const AuthorityDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Alert State
  const [alertHeadline, setAlertHeadline] = useState('');
  const [alertDisasterType, setAlertDisasterType] = useState<DisasterCategory>('Waterlogging');
  const [alertSeverity, setAlertSeverity] = useState<SeverityLevel>('High');
  const [alertInstructions, setAlertInstructions] = useState('');
  const [alertRegion, setAlertRegion] = useState('');
  const [alertSourceType, setAlertSourceType] = useState<AlertSourceType>('Control Room Operator');
  const [isPublishingAlert, setIsPublishingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');
  const canManage = currentUser ? (currentUser.role === 'AUTHORITY' || currentUser.role === 'ADMIN') : false;

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [statsData, incData, sosData, teamsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getIncidents(),
        apiService.getSOSRequests(),
        apiService.getRescueTeams(),
      ]);
      setStats(statsData);
      setIncidents(incData);
      setSosRequests(sosData);
      setTeams(teamsData);
    } catch (e) {
      console.error('Failed to load authority dashboard data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    if (!canManage) {
      alert('Access Denied: Control Room Operator or Admin permissions required.');
      return;
    }
    try {
      await apiService.updateIncident(
        incidentId,
        { status: newStatus },
        currentUser ? currentUser.role : 'AUTHORITY',
        currentUser ? currentUser.name : 'Control Room'
      );
      loadAllData();
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  const handleUpdateIncidentSeverity = async (incidentId: string, newSeverity: SeverityLevel) => {
    if (!canManage) {
      alert('Access Denied: Control Room Operator permissions required.');
      return;
    }
    try {
      await apiService.updateIncident(
        incidentId,
        { severity: newSeverity },
        currentUser ? currentUser.role : 'AUTHORITY',
        currentUser ? currentUser.name : 'Control Room'
      );
      loadAllData();
    } catch (e: any) {
      alert(`Severity update failed: ${e.message}`);
    }
  };

  const handleAssignTeamToIncident = async (incidentId: string, teamId: string) => {
    if (!canManage) {
      alert('Access Denied.');
      return;
    }
    const selectedTeam = teams.find((t) => t.teamId === teamId);
    try {
      await apiService.updateIncident(
        incidentId,
        {
          assignedTeamId: teamId,
          assignedTeamName: selectedTeam?.name,
          status: 'Response Assigned',
        },
        currentUser ? currentUser.role : 'AUTHORITY',
        currentUser ? currentUser.name : 'Control Room'
      );
      if (selectedTeam) {
        await apiService.updateTeamStatus(selectedTeam.teamId, 'Dispatched');
      }
      loadAllData();
    } catch (e: any) {
      alert(`Dispatch failed: ${e.message}`);
    }
  };

  const handleAssignTeamToSOS = async (sosId: string, teamId: string) => {
    if (!canManage) {
      alert('Access Denied.');
      return;
    }
    const selectedTeam = teams.find((t) => t.teamId === teamId);
    try {
      await apiService.updateSOSStatus(
        sosId,
        'Assigned',
        selectedTeam?.name,
        `Assigned by ${currentUser?.name || 'Control Room'}`
      );
      if (selectedTeam) {
        await apiService.updateTeamStatus(selectedTeam.teamId, 'Dispatched');
      }
      loadAllData();
    } catch (e: any) {
      alert(`SOS assignment failed: ${e.message}`);
    }
  };

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Access Denied: Only Control Room Operators can publish alerts.');
      return;
    }
    if (!alertHeadline.trim() || !alertInstructions.trim() || !alertRegion.trim()) {
      alert('Please fill out headline, instructions, and target regions.');
      return;
    }

    setIsPublishingAlert(true);
    try {
      await apiService.broadcastAlert(
        {
          title: alertHeadline,
          disasterType: alertDisasterType,
          severity: alertSeverity,
          instructions: alertInstructions,
          affectedRegions: alertRegion.split(',').map((r) => r.trim()),
          sourceType: alertSourceType,
        },
        currentUser ? currentUser.name : 'Control Room'
      );

      setIsPublishingAlert(false);
      setAlertSuccessMsg('Regional Emergency Alert broadcast published to portal stream!');
      setAlertHeadline('');
      setAlertInstructions('');
      setAlertRegion('');
      loadAllData();

      setTimeout(() => setAlertSuccessMsg(''), 5000);
    } catch (e: any) {
      setIsPublishingAlert(false);
      alert(`Alert broadcast failed: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-spin text-amber-400" />
            <span>Authority & Disaster Operations Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Response Triage Hub</h1>
          <p className="text-xs text-slate-400">
            Authenticated as <strong>{currentUser?.name || 'Authorized Operator'}</strong> ({currentUser?.role || 'None'})
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {!canManage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            You are viewing in <strong>{currentUser?.role || 'Guest'}</strong> mode (Read-Only). Switch to <strong>Control-Room Operator</strong> via the top-right role selector to triage incidents or assign teams.
          </span>
        </div>
      )}

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Triage & Verification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Incident Triage & Status Lifecycle</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {incidents.filter((i) => i.status !== 'Resolved').length} Active Hazards
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {incidents.map((incident) => (
              <div
                key={incident.incidentId}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-bold">{incident.incidentId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-700 text-white">
                      {incident.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Severity Selector */}
                    <select
                      value={incident.severity}
                      disabled={!canManage}
                      onChange={(e) =>
                        handleUpdateIncidentSeverity(incident.incidentId, e.target.value as SeverityLevel)
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-white focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>

                    {/* Status Lifecycle Selector */}
                    <select
                      value={incident.status}
                      disabled={!canManage}
                      onChange={(e) =>
                        handleUpdateIncidentStatus(incident.incidentId, e.target.value as IncidentStatus)
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-amber-400 focus:outline-none"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Verification">Under Verification</option>
                      <option value="Verified">Verified</option>
                      <option value="Response Assigned">Response Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Duplicate">Duplicate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{incident.title}</h3>
                  <p className="text-slate-300 mt-1 leading-relaxed">{incident.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700 text-slate-400 text-[11px]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{incident.locationName} ({incident.district || 'Suburban'})</span>
                  </div>
                  <div>
                    Reporter: <strong className="text-slate-200">{incident.reporterName || 'Citizen'}</strong>
                  </div>
                </div>

                {/* Team Assignment Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60 bg-slate-900/50 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Assigned Team:</span>
                    <strong className="text-blue-300">
                      {incident.assignedTeamName || 'None assigned yet'}
                    </strong>
                  </div>

                  {canManage && incident.status !== 'Resolved' && (
                    <div className="flex items-center gap-1.5">
                      <select
                        onChange={(e) => handleAssignTeamToIncident(incident.incidentId, e.target.value)}
                        defaultValue=""
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="" disabled>
                          Dispatch Response Unit...
                        </option>
                        {teams.map((t) => (
                          <option key={t.teamId} value={t.teamId}>
                            {t.name} ({t.currentStatus})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: SOS Queue & Emergency Broadcast Publisher */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority SOS Distress Queue */}
          <div className="bg-slate-800/80 border border-red-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Priority SOS Distress Calls</span>
              </h2>
              <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 text-[10px] font-black">
                {sosRequests.filter((s) => s.status !== 'Resolved').length} Pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {sosRequests.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">No active SOS distress signals.</div>
              ) : (
                sosRequests.map((sos) => (
                  <div
                    key={sos.sosId}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-700/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-bold text-[11px]">{sos.sosId}</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 font-bold text-[10px]">
                        {sos.status}
                      </span>
                    </div>

                    <div className="font-semibold text-white">{sos.emergencyType}</div>
                    <p className="text-[11px] text-slate-300">{sos.locationDescription}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>People: <strong>{sos.peopleCount}</strong></span>
                      <span>Phone: <strong>{sos.requesterPhone || 'N/A'}</strong></span>
                    </div>

                    {canManage && sos.status !== 'Resolved' && (
                      <div className="pt-1.5 flex gap-1.5 justify-end">
                        <select
                          onChange={(e) => handleAssignTeamToSOS(sos.sosId, e.target.value)}
                          defaultValue=""
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200"
                        >
                          <option value="" disabled>
                            Dispatch Unit...
                          </option>
                          {teams.map((t) => (
                            <option key={t.teamId} value={t.teamId}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => apiService.updateSOSStatus(sos.sosId, 'Resolved', undefined, 'Resolved by Command')}
                          className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Alert Publisher */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Broadcast Emergency Regional Alert</span>
            </h2>

            {alertSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                {alertSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePublishAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={alertHeadline}
                  onChange={(e) => setAlertHeadline(e.target.value)}
                  placeholder="e.g. Red Alert: Severe Inundation at Kurla & Sion"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Disaster Type</label>
                  <select
                    value={alertDisasterType}
                    onChange={(e) => setAlertDisasterType(e.target.value as DisasterCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Flood">Flood</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Heatwave">Heatwave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attributed Source</label>
                  <select
                    value={alertSourceType}
                    onChange={(e) => setAlertSourceType(e.target.value as AlertSourceType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="Control Room Operator">Control Room Operator</option>
                    <option value="Official IMD / CWC">Official IMD / CWC</option>
                    <option value="State / District DMA">State / District DMA</option>
                    <option value="Simulated Demonstration">Simulated Demonstration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Affected Localities (comma-separated)</label>
                <input
                  type="text"
                  value={alertRegion}
                  onChange={(e) => setAlertRegion(e.target.value)}
                  placeholder="e.g. Kurla West, Sion Circle, Milan Subway"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Directives</label>
                <textarea
                  value={alertInstructions}
                  onChange={(e) => setAlertInstructions(e.target.value)}
                  placeholder="e.g. Avoid venturing into subways. Move to nearest designated municipal school shelter."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPublishingAlert || !canManage}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition disabled:opacity-50"
              >
                {isPublishingAlert ? 'Broadcasting Alert...' : 'Publish Emergency Broadcast'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
