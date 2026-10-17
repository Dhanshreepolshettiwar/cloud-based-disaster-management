import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  CheckCircle,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { RescueTeam, Incident, SOSRequest, TeamStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const RescueConsole: React.FC = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const loadData = async () => {
    try {
      const [teamsData, incData, sosData] = await Promise.all([
        apiService.getRescueTeams(),
        apiService.getIncidents(),
        apiService.getSOSRequests(),
      ]);
      setTeams(teamsData);
      setIncidents(incData);
      setSosRequests(sosData);
      if (teamsData.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamsData[0].teamId);
      }
    } catch (e) {
      console.error('Error loading rescue console data:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeTeam = teams.find((t) => t.teamId === selectedTeamId) || teams[0];

  const assignedIncidents = incidents.filter(
    (i) => i.assignedTeamId === activeTeam?.teamId || i.assignedTeamName === activeTeam?.name
  );

  const assignedSOS = sosRequests.filter(
    (s) => s.assignedTeamId === activeTeam?.teamId || s.assignedTeamName === activeTeam?.name
  );

  const handleStatusChange = async (newStatus: TeamStatus) => {
    if (!activeTeam) return;
    try {
      await apiService.updateTeamStatus(activeTeam.teamId, newStatus);
      loadData();
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  const handleCompleteMission = async (incidentId: string) => {
    try {
      await apiService.updateIncident(
        incidentId,
        { status: 'Resolved' },
        currentUser.role,
        currentUser.name
      );
      if (activeTeam) {
        await apiService.updateTeamStatus(activeTeam.teamId, 'Available');
      }
      loadData();
      alert('Mission marked as Resolved! Team status set to Available.');
    } catch (e: any) {
      alert(`Error completing mission: ${e.message}`);
    }
  };

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Dispatched':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'On Scene':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Unit Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Field Responder Operations Console
          </div>
          <h1 className="text-2xl font-extrabold text-white">Rescue Team Coordination</h1>
          <p className="text-xs text-slate-400">
            Active User: <strong>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        {/* Team Unit Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-300">Active Unit:</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
          >
            {teams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {t.name} ({t.specialization})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Status & Readiness Card */}
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{activeTeam.name}</h2>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${getStatusColor(activeTeam.currentStatus)}`}>
                {activeTeam.currentStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-400">Specialization:</span>
                <span className="font-semibold text-white">{activeTeam.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deployable Crew:</span>
                <span className="font-semibold text-white">{activeTeam.membersCount} Certified Responders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Comms:</span>
                <span className="font-semibold text-white">{activeTeam.contactPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Station Depot:</span>
                <span className="font-semibold text-white">{activeTeam.baseLocation}</span>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-3 border-t border-slate-700/60">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Update Operational Status:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange('Available')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activeTeam.currentStatus === 'Available'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => handleStatusChange('Dispatched')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activeTeam.currentStatus === 'Dispatched'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  En Route
                </button>
                <button
                  onClick={() => handleStatusChange('On Scene')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activeTeam.currentStatus === 'On Scene'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  On Scene
                </button>
                <button
                  onClick={() => handleStatusChange('Resting')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activeTeam.currentStatus === 'Resting'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Resting / Shift End
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Missions / Incidents & SOS */}
          <div className="lg:col-span-2 space-y-5">
            {/* Active SOS Distresses Assigned to Team */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Assigned Citizen SOS Callouts ({assignedSOS.length})
              </h2>

              {assignedSOS.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
                  No active SOS callouts assigned to {activeTeam.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedSOS.map((sos) => (
                    <div
                      key={sos.sosId}
                      className="bg-slate-900/90 border border-red-500/40 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 uppercase">{sos.emergencyType}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30">
                          {sos.urgency} Urgency
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{sos.locationDescription}</div>
                      <div className="text-xs text-slate-300">
                        Requester: <strong>{sos.requesterName}</strong> • Phone: {sos.requesterPhone} • Persons at Risk: {sos.peopleCount}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={async () => {
                            await apiService.updateSOSStatus(sos.sosId, 'Resolved', activeTeam.name, 'Rescued safely by team');
                            loadData();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          Mark Citizens Rescued
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Incidents Assigned to Team */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Assigned Disaster Operations ({assignedIncidents.length})
              </h2>

              {assignedIncidents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
                  No full incidents currently assigned to {activeTeam.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedIncidents.map((inc) => (
                    <div key={inc.incidentId} className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">{inc.category}</span>
                        <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {inc.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{inc.title}</div>
                      <p className="text-xs text-slate-300">{inc.description}</p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {inc.locationName}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <span className="text-[11px] text-slate-400">Severity: {inc.severity}</span>
                        <button
                          onClick={() => handleCompleteMission(inc.incidentId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Incident Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
