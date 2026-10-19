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
  Activity,
  Layers,
  ChevronRight,
  Filter,
  Search,
  Truck,
  Check,
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

  // Active view tab in Command Hub
  const [activeTab, setActiveTab] = useState<'incidents' | 'sos' | 'teams' | 'alerts' | 'activity'>('incidents');

  // Search & Filter for Incidents
  const [incidentSearch, setIncidentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // New Alert State
  const [alertHeadline, setAlertHeadline] = useState('');
  const [alertDisasterType, setAlertDisasterType] = useState<DisasterCategory>('Waterlogging');
  const [alertSeverity, setAlertSeverity] = useState<SeverityLevel>('High');
  const [alertInstructions, setAlertInstructions] = useState('');
  const [alertRegion, setAlertRegion] = useState('');
  const [alertSourceType, setAlertSourceType] = useState<AlertSourceType>('Control Room Operator');
  const [isPublishingAlert, setIsPublishingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');

  // Operational Activity Log (Audit actions within session)
  const [activityLogs, setActivityLogs] = useState<{ id: string; time: string; text: string; type: 'triage' | 'sos' | 'alert' | 'dispatch' }[]>([
    {
      id: 'log-1',
      time: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      text: 'Control Room initiated automated weather sensor sync for Mumbai Suburban area.',
      type: 'triage',
    },
    {
      id: 'log-2',
      time: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString(),
      text: 'NDRF Flood Unit Alpha placed on active standby for Mithi River catchment.',
      type: 'dispatch',
    },
  ]);

  const canManage = currentUser ? currentUser.role === 'AUTHORITY' || currentUser.role === 'ADMIN' : false;

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

  const addActivityLog = (text: string, type: 'triage' | 'sos' | 'alert' | 'dispatch') => {
    setActivityLogs((prev) => [
      { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString(), text, type },
      ...prev.slice(0, 30),
    ]);
  };

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
      addActivityLog(`Incident ${incidentId} transitioned to "${newStatus}" by ${currentUser?.name || 'Operator'}.`, 'triage');
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
      addActivityLog(`Incident ${incidentId} severity reassessed to "${newSeverity}".`, 'triage');
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
      addActivityLog(`Dispatched "${selectedTeam?.name || teamId}" to Incident ${incidentId}.`, 'dispatch');
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
      addActivityLog(`SOS Beacon ${sosId} assigned to responder unit "${selectedTeam?.name}".`, 'sos');
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
      addActivityLog(`Broadcasted Regional Emergency Alert: "${alertHeadline}".`, 'alert');
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

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (incidentSearch.trim()) {
      const q = incidentSearch.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.incidentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-spin text-amber-500" />
            <span>Authority & Disaster Operations Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Emergency Response Triage Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticated as <strong>{currentUser?.name || 'Authorized Operator'}</strong> ({currentUser?.role || 'Guest'})
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {!canManage && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            You are viewing in <strong>{currentUser?.role || 'Guest'}</strong> mode (Read-Only). Switch to <strong>Control-Room Operator</strong> via the role switcher in the sidebar to triage incidents or assign rescue units.
          </span>
        </div>
      )}

      {/* Section 1: Incident Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Hazards</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {incidents.filter((i) => i.status !== 'Resolved').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">ongoing incidents</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical Threats</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            {incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length}
          </div>
          <span className="text-[10px] text-red-500/80 mt-1">immediate action needed</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Pending SOS</span>
            <Radio className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {sosRequests.filter((s) => s.status !== 'Resolved').length}
          </div>
          <span className="text-[10px] text-rose-500/80 mt-1">distress beacons active</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Field Units Deployed</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {teams.filter((t) => t.currentStatus === 'Dispatched').length}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {teams.length}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">units actively dispatched</span>
        </div>
      </div>

      {/* Navigation Tabs for Command Operations */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'incidents'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Active Incidents ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'sos'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>SOS Distress Queue ({sosRequests.filter((s) => s.status !== 'Resolved').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'teams'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Response Units ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Emergency Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operational Feed ({activityLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Incidents Triage Table / Cards */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={incidentSearch}
                onChange={(e) => setIncidentSearch(e.target.value)}
                placeholder="Search incident ID, title, locality..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Verified">Verified</option>
                <option value="Response Assigned">Response Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                No incidents match filter criteria.
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.incidentId}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 text-xs transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{incident.incidentId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white">
                        {incident.category}
                      </span>
                      {(incident.peopleAffected ?? 0) > 0 && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          • {incident.peopleAffected} citizens affected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Severity Selector */}
                      <select
                        value={incident.severity}
                        disabled={!canManage}
                        onChange={(e) =>
                          handleUpdateIncidentSeverity(incident.incidentId, e.target.value as SeverityLevel)
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-black border focus:outline-none ${
                          incident.severity === 'Critical'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600'
                            : incident.severity === 'High'
                            ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700'
                        }`}
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
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 focus:outline-none"
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
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{incident.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{incident.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{incident.locationName} ({incident.district || 'Suburban'})</span>
                    </div>
                    <div>
                      Reporter: <strong className="text-slate-700 dark:text-slate-200">{incident.reporterName || 'Citizen'}</strong>
                    </div>
                  </div>

                  {/* Team Assignment Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Assigned Response Unit:</span>
                      <strong className="text-blue-600 dark:text-blue-300">
                        {incident.assignedTeamName || 'None assigned yet'}
                      </strong>
                    </div>

                    {canManage && incident.status !== 'Resolved' && (
                      <div className="flex items-center gap-1.5">
                        <select
                          onChange={(e) => handleAssignTeamToIncident(incident.incidentId, e.target.value)}
                          defaultValue=""
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="" disabled>
                            Dispatch Unit...
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
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: SOS Distress Calls */}
      {activeTab === 'sos' && (
        <div className="space-y-3">
          {sosRequests.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
              No active SOS distress beacons recorded.
            </div>
          ) : (
            sosRequests.map((sos) => (
              <div
                key={sos.sosId}
                className="bg-white dark:bg-slate-800/90 border border-red-200 dark:border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">{sos.sosId}</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 font-bold text-[10px]">
                      {sos.status}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(sos.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-bold text-slate-900 dark:text-white text-sm">{sos.emergencyType}</div>
                <p className="text-slate-600 dark:text-slate-300">{sos.locationDescription}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div>People: <strong className="text-slate-900 dark:text-white">{sos.peopleCount}</strong></div>
                  <div>Phone: <strong className="text-slate-900 dark:text-white">{sos.requesterPhone || 'N/A'}</strong></div>
                  <div>District: <strong className="text-slate-900 dark:text-white">{sos.district}</strong></div>
                  <div>Assigned: <strong className="text-blue-600 dark:text-blue-400">{sos.assignedTeamName || 'Unassigned'}</strong></div>
                </div>

                {canManage && sos.status !== 'Resolved' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                    <select
                      onChange={(e) => handleAssignTeamToSOS(sos.sosId, e.target.value)}
                      defaultValue=""
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200"
                    >
                      <option value="" disabled>
                        Dispatch Response Unit...
                      </option>
                      {teams.map((t) => (
                        <option key={t.teamId} value={t.teamId}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        apiService.updateSOSStatus(sos.sosId, 'Resolved', undefined, 'Resolved by Command');
                        addActivityLog(`SOS Beacon ${sos.sosId} resolved by Command.`, 'sos');
                        loadAllData();
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Response Teams Fleet */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div
              key={t.teamId}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 text-xs transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    t.currentStatus === 'Dispatched'
                      ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400'
                      : t.currentStatus === 'On Scene'
                      ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {t.currentStatus}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div>Contact: <strong className="text-slate-800 dark:text-slate-200">{t.contactPhone}</strong></div>
                <div>Base: <strong className="text-slate-800 dark:text-slate-200">{t.baseLocation}</strong></div>
                <div>Capacity: <strong className="text-slate-800 dark:text-slate-200">{t.membersCount} personnel</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {t.specialization}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Emergency Alert Publisher */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Broadcast Emergency Regional Alert</h2>
          </div>

          {alertSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs">
              {alertSuccessMsg}
            </div>
          )}

          <form onSubmit={handlePublishAlert} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alert Headline</label>
              <input
                type="text"
                value={alertHeadline}
                onChange={(e) => setAlertHeadline(e.target.value)}
                placeholder="e.g. Red Alert: Severe Inundation at Kurla & Sion"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Disaster Type</label>
                <select
                  value={alertDisasterType}
                  onChange={(e) => setAlertDisasterType(e.target.value as DisasterCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Waterlogging">Waterlogging</option>
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Heatwave">Heatwave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Attributed Source</label>
                <select
                  value={alertSourceType}
                  onChange={(e) => setAlertSourceType(e.target.value as AlertSourceType)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Control Room Operator">Control Room Operator</option>
                  <option value="Official IMD / CWC">Official IMD / CWC</option>
                  <option value="State / District DMA">State / District DMA</option>
                  <option value="Simulated Demonstration">Simulated Demonstration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Affected Localities (comma-separated)</label>
              <input
                type="text"
                value={alertRegion}
                onChange={(e) => setAlertRegion(e.target.value)}
                placeholder="e.g. Kurla West, Sion Circle, Milan Subway"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Official Directives</label>
              <textarea
                value={alertInstructions}
                onChange={(e) => setAlertInstructions(e.target.value)}
                placeholder="e.g. Avoid venturing into subways. Move to nearest designated municipal school shelter."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPublishingAlert || !canManage}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition disabled:opacity-50 shadow-md"
            >
              {isPublishingAlert ? 'Broadcasting Alert...' : 'Publish Emergency Broadcast'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Operational Activity Feed */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span>Real-Time Incident Triage & Operational Event Stream</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Session Audit</span>
          </div>

          <div className="space-y-2 text-xs">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3"
              >
                <span className="font-mono text-slate-400 text-[11px] shrink-0">{log.time}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] shrink-0 ${
                    log.type === 'sos'
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                      : log.type === 'dispatch'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : log.type === 'alert'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-slate-700 dark:text-slate-300 flex-1">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
