import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Server,
  Database,
  Cloud,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Pending';
}

export const AdminPanel: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

  const [users, setUsers] = useState<SystemUser[]>([
    { id: 'usr-1', name: 'Dhanshree Citizen', email: 'citizen@disasterguard.org', role: 'CITIZEN', status: 'Active' },
    { id: 'usr-2', name: 'Commander Sharma', email: 'authority@disasterguard.org', role: 'AUTHORITY', status: 'Active' },
    { id: 'usr-3', name: 'Captain Rohit (Water Rescue)', email: 'rescue.lead@disasterguard.org', role: 'RESCUE_TEAM', status: 'Active' },
    { id: 'usr-4', name: 'System Administrator', email: 'admin@disasterguard.org', role: 'ADMIN', status: 'Active' },
  ]);

  const [auditLogs] = useState([
    { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'INFO', message: 'API Gateway processed GET /incidents - 200 OK' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), level: 'WARN', message: 'Amazon SNS emergency alert broadcast published to topic disaster-emergency-alerts-topic' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), level: 'INFO', message: 'S3 Presigned URL generated for incident photo upload' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), level: 'INFO', message: 'DynamoDB PutCommand registered new SOS distress request' },
  ]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    alert(`User role updated to ${newRole}. RBAC policy enforced.`);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default disaster records?')) {
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
            System Administration & Cloud Governance
          </div>
          <h1 className="text-2xl font-extrabold text-white">Security & Cloud Control Panel</h1>
          <p className="text-xs text-slate-400">
            Authenticated as <strong>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-semibold text-slate-200 transition"
        >
          Reset Demo Mock State
        </button>
      </div>

      {/* Cloud Infrastructure Configuration Matrix */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-purple-400" />
          AWS Cloud Architecture Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Amazon Cognito
            </div>
            <div className="text-slate-400">User Pool: disaster-management-user-pool</div>
            <div className="text-emerald-400 font-semibold">RBAC Groups: CITIZEN, AUTHORITY, RESCUE_TEAM, ADMIN</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Amazon DynamoDB
            </div>
            <div className="text-slate-400">Pay-Per-Request On-Demand billing</div>
            <div className="text-amber-400 font-semibold">6 Tables with GSIs (StatusIndex, SOSStatusIndex)</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              AWS Lambda & API Gateway
            </div>
            <div className="text-slate-400">Node.js 20.x Serverless Handlers</div>
            <div className="text-blue-400 font-semibold">Least-privilege IAM Execution Roles</div>
          </div>
        </div>
      </div>

      {/* User RBAC Management */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          User Roster & Role-Based Access Control (RBAC)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Assigned RBAC Role</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Switch Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-3">{u.email}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="CITIZEN">CITIZEN</option>
                      <option value="AUTHORITY">AUTHORITY</option>
                      <option value="RESCUE_TEAM">RESCUE_TEAM</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => switchRole(u.role)}
                      className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
                    >
                      Assume Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CloudWatch Structured Logging Stream */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          Amazon CloudWatch Log Group Telemetry (`/aws/lambda/disaster-*`)
        </h2>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-52 overflow-y-auto">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span
                className={`font-bold ${
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
