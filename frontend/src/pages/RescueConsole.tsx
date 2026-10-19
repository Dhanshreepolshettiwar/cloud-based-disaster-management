import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  CheckCircle,
  MapPin,
  AlertTriangle,
  Radio,
  Clock,
  HeartPulse,
  Navigation,
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
  const [victimsRescuedInput, setVictimsRescuedInput] = useState<number>(0);

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
        {
          status: 'Resolved',
          peopleAffected: Math.max(0, (assignedIncidents.find((i) => i.incidentId === incidentId)?.peopleAffected || 0) - victimsRescuedInput),
        },
        currentUser ? currentUser.role : 'RESCUE_TEAM',
        currentUser ? currentUser.name : 'Field Responder'
      );
      if (activeTeam) {
        await apiService.updateTeamStatus(activeTeam.teamId, 'Available');
      }
      setVictimsRescuedInput(0);
      loadData();
      alert('Mission marked as Resolved! Team status reset to Available.');
    } catch (e: any) {
      alert(`Error completing mission: ${e.message}`);
    }
  };

  const handleCompleteSOS = async (sosId: string) => {
    try {
      await apiService.updateSOSStatus(
        sosId,
        'Resolved',
        activeTeam?.name,
        `Resolved by field responder ${currentUser ? currentUser.name : 'Responder'}`
      );
      if (activeTeam) {
        await apiService.updateTeamStatus(activeTeam.teamId, 'Available');
      }
      loadData();
      alert('SOS distress call marked as Rescued & Resolved.');
    } catch (e: any) {
      alert(`Error updating SOS: ${e.message}`);
    }
  };

  const getStatusColor = (status: TeamStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40';
      case 'Dispatched':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40';
      case 'On Scene':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40 font-bold';
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Unit Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Field Responder Coordination Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Rescue Unit Deployment Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active Unit: <strong>{activeTeam?.name || 'Loading...'}</strong> ({activeTeam?.agency || 'Disaster Agency'})
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">Select Unit:</label>
          <select
            value={activeTeam?.teamId || ''}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            {teams.map((team) => (
              <option key={team.teamId} value={team.teamId}>
                {team.name} ({team.currentStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Unit Status Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Unit Profile</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(activeTeam.currentStatus)}`}>
                  {activeTeam.currentStatus}
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{activeTeam.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeTeam.agency}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Specialization:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeTeam.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Personnel Strength:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeTeam.membersCount} Responders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Staging Base:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right truncate max-w-[180px]">
                    {activeTeam.baseLocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Emergency VHF / Phone:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{activeTeam.contactPhone}</span>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Update Operational Status:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {(['Available', 'Dispatched', 'On Scene', 'Resting'] as TeamStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-3 rounded-xl border transition ${
                        activeTeam.currentStatus === st
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Missions & Tasks */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Assigned Emergency Missions ({assignedIncidents.length + assignedSOS.length})</span>
            </h2>

            {assignedIncidents.length === 0 && assignedSOS.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                No active incidents or SOS distress tickets currently assigned to this unit.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Assigned Incidents */}
                {assignedIncidents.map((inc) => (
                  <div
                    key={inc.incidentId}
                    className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 text-xs shadow-sm transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{inc.incidentId}</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 font-bold text-[10px]">
                          {inc.severity} Severity
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                          {inc.category}
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">Status: <strong className="text-slate-900 dark:text-white">{inc.status}</strong></span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{inc.description}</p>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{inc.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                        <Navigation className="w-3 h-3 text-blue-500" />
                        <span>{inc.latitude.toFixed(4)}° N, {inc.longitude.toFixed(4)}° E</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">Victims Rescued:</span>
                        <input
                          type="number"
                          min="0"
                          value={victimsRescuedInput}
                          onChange={(e) => setVictimsRescuedInput(parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-bold"
                        />
                      </div>

                      <button
                        onClick={() => handleCompleteMission(inc.incidentId)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Mission Resolved</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Assigned SOS Calls */}
                {assignedSOS.map((sos) => (
                  <div
                    key={sos.sosId}
                    className="bg-white dark:bg-slate-800/80 border border-red-200 dark:border-red-500/40 rounded-2xl p-5 space-y-3 text-xs shadow-sm transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-600 dark:text-red-400 font-bold">{sos.sosId}</span>
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                          PRIORITY SOS
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {sos.peopleCount} Persons Reported Trapped
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sos.emergencyType}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{sos.locationDescription}</p>

                    {sos.specialNeeds && sos.specialNeeds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sos.specialNeeds.map((need, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-300 dark:border-rose-500/40"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleCompleteSOS(sos.sosId)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Victims Rescued</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
