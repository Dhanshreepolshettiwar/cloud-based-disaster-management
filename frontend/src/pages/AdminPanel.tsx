import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Server,
  Database,
  Cloud,
  Terminal,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, RegionalScenarioId } from '../types';
import { apiService } from '../services/api';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Pending';
}

interface AdminPanelProps {
  currentScenario: RegionalScenarioId;
  onScenarioChange: (id: RegionalScenarioId) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentScenario,
  onScenarioChange,
}) => {
  const { currentUser, quickLogin } = useAuth();
  const scenarios = apiService.getAllScenarios();

  const [users, setUsers] = useState<SystemUser[]>([
    { id: 'usr-1', name: 'Citizen User', email: 'citizen@disasterguard.in', role: 'CITIZEN', status: 'Active' },
    { id: 'usr-2', name: 'Commander Sharma (Control Room)', email: 'authority@disasterguard.in', role: 'AUTHORITY', status: 'Active' },
    { id: 'usr-3', name: 'Inspector Rawat (NDRF 5th Battalion)', email: 'responder@disasterguard.in', role: 'RESCUE_TEAM', status: 'Active' },
    { id: 'usr-4', name: 'National System Administrator', email: 'admin@disasterguard.in', role: 'ADMIN', status: 'Active' },
  ]);

  const [auditLogs] = useState([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      level: 'INFO',
      message: 'API Gateway processed GET /incidents (Regional scenario: Mumbai Monsoon)',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      level: 'WARN',
      message: 'Simulated Emergency Alert broadcast published to topic disaster-emergency-alerts-topic',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      level: 'INFO',
      message: 'S3 Presigned URL generated for incident evidence photo attachment',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      level: 'INFO',
      message: 'DynamoDB / Disk Store PutCommand recorded new SOS distress beacon',
    },
  ]);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'Local Browser Simulation Storage';

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    alert(`User role updated to ${newRole}. RBAC policy updated.`);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default synthetic disaster scenarios?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>National Governance & Cloud Control Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">System Administration & Security</h1>
          <p className="text-xs text-slate-400">
            Signed in as <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role || 'ADMIN'})
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition"
        >
          Reset Demo Data Store
        </button>
      </div>

      {/* Demonstration Scenario Configuration */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Active Demonstration Disaster Scenario</span>
          </h2>
          <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            Synthetic Scenario Testing Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const isSelected = sc.id === currentScenario;
            return (
              <div
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-750 border-amber-500 shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{sc.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <div className="text-amber-400 font-semibold">{sc.hazardTitle}</div>
                <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                  {sc.scenarioDescription}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AWS Cloud Architecture & Integration Disclosure */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-purple-400" />
          <span>Cloud Services & Deployment Status</span>
        </h2>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300 space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-400">API Endpoint (`VITE_API_BASE_URL`):</span>
            <span className="font-mono text-emerald-400 font-bold">{apiBase}</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Platform features dual-mode architecture: Runs locally with simulated storage, and switches to live AWS Lambda / DynamoDB when AWS credentials and SAM infrastructure are deployed.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Amazon Cognito & RBAC</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Active User Pool: <strong>disaster-management-user-pool</strong>. Role groups enforce Citizen, Control-Room, Responder, and Admin scopes.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Amazon DynamoDB</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Tables: `disaster_incidents`, `disaster_sos`, `disaster_shelters`, `rescue_teams`. Disk JSON persistence active during local development.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Amazon S3 & SNS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-[11px]">
              Presigned upload URLs for incident media attachments; SNS topic simulation for regional emergency broadcast transmission.
            </p>
          </div>
        </div>
      </div>

      {/* RBAC User Directory */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-sm sm:text-base font-bold text-white">Role-Based Access Control (RBAC) User Directory</h2>
          <span className="text-xs text-slate-400">{users.length} Active System Identities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3 sm:p-4">User</th>
                <th className="p-3 sm:p-4">Assigned Role</th>
                <th className="p-3 sm:p-4">Permissions Scope</th>
                <th className="p-3 sm:p-4 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-750/50 transition">
                  <td className="p-3 sm:p-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-amber-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-slate-400 text-[11px]">
                    {u.role === 'ADMIN'
                      ? 'Full Governance & Scenarios'
                      : u.role === 'AUTHORITY'
                      ? 'Incident Triage & Team Dispatch'
                      : u.role === 'RESCUE_TEAM'
                      ? 'Field Operations & Resolution'
                      : 'Distress Beacon & Reporting'}
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="CITIZEN">Citizen</option>
                      <option value="AUTHORITY">Control-Room Operator</option>
                      <option value="RESCUE_TEAM">Field Responder</option>
                      <option value="ADMIN">System Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CloudWatch Audit Log Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Structured CloudWatch Audit Logs</span>
          </span>
          <span className="text-[10px]">Log Stream: `/aws/lambda/disaster-guard-api`</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-300">
              <span className="text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`font-bold shrink-0 ${
                  log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
