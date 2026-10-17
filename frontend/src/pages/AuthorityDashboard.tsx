import React, { useState, useEffect } from 'react';
import {
  Radio,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../services/api';
import {
  Incident,
  SOSRequest,
  RescueTeam,
  DashboardStats,
  IncidentStatus,
  SeverityLevel,
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
  const [alertSeverity, setAlertSeverity] = useState<SeverityLevel>('High');
  const [alertInstructions, setAlertInstructions] = useState('');
  const [alertRegion, setAlertRegion] = useState('');
  const [isPublishingAlert, setIsPublishingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');

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
    const interval = setInterval(loadAllData, 8000); // 8s polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      await apiService.updateIncident(
        incidentId,
        { status: newStatus },
        currentUser.role,
        currentUser.name
      );
      loadAllData();
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  const handleUpdateIncidentSeverity = async (incidentId: string, newSeverity: SeverityLevel) => {
    try {
      await apiService.updateIncident(
        incidentId,
        { severity: newSeverity },
        currentUser.role,
        currentUser.name
      );
      loadAllData();
    } catch (e: any) {
      alert(`Severity update failed: ${e.message}`);
    }
  };

  const handleAssignTeamToIncident = async (incidentId: string, teamId: string) => {
    const selectedTeam = teams.find((t) => t.teamId === teamId);
    try {
      await apiService.updateIncident(
        incidentId,
        {
          assignedTeamId: teamId,
          assignedTeamName: selectedTeam?.name,
          status: 'Response Assigned',
        },
        currentUser.role,
        currentUser.name
      );

      if (selectedTeam) {
        await apiService.updateTeamStatus(teamId, 'Dispatched');
      }
      loadAllData();
    } catch (e: any) {
      alert(`Assignment failed: ${e.message}`);
    }
  };

  const handleUpdateSOSStatus = async (sosId: string, newStatus: SOSRequest['status'], teamName?: string) => {
    try {
      await apiService.updateSOSStatus(sosId, newStatus, teamName);
      loadAllData();
    } catch (e: any) {
      alert(`SOS status update failed: ${e.message}`);
    }
  };

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertHeadline.trim() || !alertInstructions.trim()) {
      alert('Please fill out alert headline and instructions.');
      return;
    }

    setIsPublishingAlert(true);
    try {
      const regions = alertRegion.trim() ? alertRegion.split(',').map((r) => r.trim()) : ['All Affected Areas'];
      await apiService.broadcastAlert(
        {
          title: alertHeadline,
          severity: alertSeverity,
          affectedRegions: regions,
          instructions: alertInstructions,
        },
        currentUser.name
      );

      setIsPublishingAlert(false);
      setAlertSuccessMsg('Emergency broadcast published via Amazon SNS and logged to database!');
      setAlertHeadline('');
      setAlertInstructions('');
      setAlertRegion('');
      setTimeout(() => setAlertSuccessMsg(''), 5000);
      loadAllData();
    } catch (err: any) {
      setIsPublishingAlert(false);
      alert(`Failed to broadcast alert: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            Operations Command Control Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">Disaster Triage & Dispatch Hub</h1>
          <p className="text-xs text-slate-400">
            Authenticated as <strong>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold border border-slate-600 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Polling AWS Data...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Live Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md">
          <div className="text-slate-400 text-xs font-medium">Total Incidents</div>
          <div className="text-2xl font-black text-white mt-1">{stats?.totalIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged across all zones</div>
        </div>

        <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-4 shadow-md">
          <div className="text-amber-400 text-xs font-semibold">Active Incidents</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats?.activeIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requiring ongoing ops</div>
        </div>

        <div className="bg-slate-800/80 border border-red-500/40 rounded-xl p-4 shadow-md bg-gradient-to-b from-slate-800/90 to-red-950/20">
          <div className="text-red-400 text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical Severe
          </div>
          <div className="text-2xl font-black text-red-500 mt-1">{stats?.criticalIncidents ?? 0}</div>
          <div className="text-[11px] text-red-300/80 mt-1">Life danger triage</div>
        </div>

        <div className="bg-slate-800/80 border border-rose-500/40 rounded-xl p-4 shadow-md">
          <div className="text-rose-400 text-xs font-bold">Open SOS Distress</div>
          <div className="text-2xl font-black text-rose-500 mt-1">{stats?.openSOSRequests ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active citizen signals</div>
        </div>

        <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-4 shadow-md">
          <div className="text-blue-400 text-xs font-semibold">Teams Dispatched</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{stats?.teamsDispatched ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Of {teams.length} total units</div>
        </div>

        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-4 shadow-md">
          <div className="text-emerald-400 text-xs font-semibold">Shelter Vacancy</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.shelterAvailableSlots ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Free capacity available</div>
        </div>
      </div>

      {/* SOS Distress Calls Queue */}
      <div className="bg-slate-800/70 border border-red-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live Citizen SOS Distress Triage</h2>
              <p className="text-xs text-red-400">Incoming emergency signals requiring immediate response dispatch</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-red-600/30 text-red-300 font-bold border border-red-500/40">
            {sosRequests.filter((s) => s.status !== 'Resolved').length} Active Calls
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sosRequests.length === 0 ? (
            <div className="col-span-2 text-center p-6 text-slate-400">No distress signals currently active.</div>
          ) : (
            sosRequests.map((sos) => (
              <div
                key={sos.sosId}
                className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                    {sos.emergencyType}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      sos.status === 'Submitted'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : sos.status === 'Responding'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {sos.status}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">{sos.locationDescription}</div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div>
                    Requester: <strong>{sos.requesterName}</strong>
                  </div>
                  <div>
                    Phone: <strong>{sos.requesterPhone}</strong>
                  </div>
                  <div>
                    People at Risk: <strong className="text-red-400">{sos.peopleCount}</strong>
                  </div>
                  <div>
                    Assigned: <strong>{sos.assignedTeamName || 'None Yet'}</strong>
                  </div>
                </div>

                {/* Authority Triage Actions */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateSOSStatus(sos.sosId, 'Acknowledged')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    Acknowledge
                  </button>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const t = teams.find((team) => team.teamId === e.target.value);
                        handleUpdateSOSStatus(sos.sosId, 'Responding', t?.name);
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Dispatch Team...
                    </option>
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.name} ({t.specialization})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleUpdateSOSStatus(sos.sosId, 'Resolved')}
                    className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-500/40 text-xs font-semibold ml-auto"
                  >
                    Mark Rescued
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Incidents Management Table */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Incident Triage & Resource Allocation Queue
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Category & Title</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Rescue Team</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {incidents.map((inc) => (
                <tr key={inc.incidentId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-sm">{inc.title}</div>
                    <div className="text-[11px] text-slate-400">{inc.category} • ID: {inc.incidentId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div>{inc.locationName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {inc.latitude}, {inc.longitude}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={inc.severity}
                      onChange={(e) => handleUpdateIncidentSeverity(inc.incidentId, e.target.value as SeverityLevel)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={inc.status}
                      onChange={(e) => handleUpdateIncidentStatus(inc.incidentId, e.target.value as IncidentStatus)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Response Assigned">Response Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={inc.assignedTeamId || ''}
                      onChange={(e) => handleAssignTeamToIncident(inc.incidentId, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white max-w-[180px]"
                    >
                      <option value="">-- Assign Unit --</option>
                      {teams.map((t) => (
                        <option key={t.teamId} value={t.teamId}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleUpdateIncidentStatus(inc.incidentId, 'Resolved')}
                      className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Emergency Alert Form (SNS) */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Broadcast Emergency Alert (Amazon SNS Integration)</h2>
            <p className="text-xs text-slate-400">
              Transmit official high-priority public disaster broadcasts to registered citizens and responders
            </p>
          </div>
        </div>

        {alertSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {alertSuccessMsg}
          </div>
        )}

        <form onSubmit={handlePublishAlert} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline / Title</label>
              <input
                type="text"
                required
                value={alertHeadline}
                onChange={(e) => setAlertHeadline(e.target.value)}
                placeholder="E.g., RED ALERT: Flash Flood Rising - Evacuate Delta Sector"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Critical">Critical (Immediate Hazard)</option>
                <option value="High">High (Serious Warning)</option>
                <option value="Medium">Medium (Advisory)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Affected Zones / Municipal Wards (comma separated)
              </label>
              <input
                type="text"
                value={alertRegion}
                onChange={(e) => setAlertRegion(e.target.value)}
                placeholder="E.g., North Delta 3, Riverbank Corridor, Sector 12"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Instructions</label>
              <input
                type="text"
                required
                value={alertInstructions}
                onChange={(e) => setAlertInstructions(e.target.value)}
                placeholder="E.g., Move to designated stadium shelter. Do not cross river bridge."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPublishingAlert}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs tracking-wider uppercase transition flex items-center gap-2 shadow-lg shadow-red-600/30"
          >
            <Send className="w-4 h-4" />
            {isPublishingAlert ? 'Broadcasting via SNS...' : 'Broadcast Emergency Alert'}
          </button>
        </form>
      </div>
    </div>
  );
};
