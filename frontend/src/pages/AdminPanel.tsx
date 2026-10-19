import React, { useState, useEffect } from 'react';
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
  Search,
  Filter,
  Copy,
  Trash2,
  ExternalLink,
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

interface AuditLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: 'CloudWatch' | 'AuditTrail';
  message: string;
  meta?: string;
}

interface AdminPanelProps {
  currentScenario: RegionalScenarioId;
  onScenarioChange: (id: RegionalScenarioId) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentScenario,
  onScenarioChange,
}) => {
  const { currentUser } = useAuth();
  const scenarios = apiService.getAllScenarios();

  const [users, setUsers] = useState<SystemUser[]>([
    { id: 'usr-1', name: 'Citizen User', email: 'citizen@disasterguard.in', role: 'CITIZEN', status: 'Active' },
    { id: 'usr-2', name: 'Commander Sharma (Control Room)', email: 'authority@disasterguard.in', role: 'AUTHORITY', status: 'Active' },
    { id: 'usr-3', name: 'Inspector Rawat (NDRF 5th Battalion)', email: 'responder@disasterguard.in', role: 'RESCUE_TEAM', status: 'Active' },
    { id: 'usr-4', name: 'National System Administrator', email: 'admin@disasterguard.in', role: 'ADMIN', status: 'Active' },
  ]);

  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      level: 'INFO',
      source: 'CloudWatch',
      message: 'API Gateway HTTP GET 200 /incidents (Mumbai Monsoon Regional Bounds)',
      meta: 'RequestId: c6f18a20-413d-4c3e-8c34-9d6288b64e10 Duration: 38ms',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      level: 'INFO',
      source: 'CloudWatch',
      message: 'DynamoDB Query disaster_incidents executed with index RegionalScenario-index',
      meta: 'ConsumedCapacity: 1.0 RCU Status: OK',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      level: 'WARN',
      source: 'AuditTrail',
      message: 'Emergency Broadcast issued for Kurla West & Sion underpass flood hazard',
      meta: 'TopicArn: arn:aws:sns:ap-south-1:112859066646:disaster-emergency-alerts-topic',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      level: 'INFO',
      source: 'CloudWatch',
      message: 'S3 Presigned Upload URL generated for incident photographic evidence',
      meta: 'Bucket: disaster-guard-evidence-private Key: damage-reports/kranti-nagar-01.jpg',
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      level: 'INFO',
      source: 'AuditTrail',
      message: 'NDRF Unit Alpha dispatched to Bail Bazar tenement evacuation coordinates',
      meta: 'Actor: Control-Room Officer Sharma',
    },
  ]);

  // Log Viewer Filters
  const [logSearch, setLogSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logSourceFilter, setLogSourceFilter] = useState<'ALL' | 'CloudWatch' | 'AuditTrail'>('ALL');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'Local Browser Simulation Storage';
  const awsRegion = import.meta.env.VITE_AWS_REGION || 'ap-south-1';

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Add real audit log entry
    setLogs((prev) => [
      {
        timestamp: new Date().toISOString(),
        level: 'WARN',
        source: 'AuditTrail',
        message: `RBAC security policy changed: User ${userId} granted role [${newRole}]`,
        meta: `ModifiedBy: ${currentUser?.email || 'admin@disasterguard.in'}`,
      },
      ...prev,
    ]);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default synthetic disaster scenarios?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleCopyLogs = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter((log) => {
    if (logLevelFilter !== 'ALL' && log.level !== logLevelFilter) return false;
    if (logSourceFilter !== 'ALL' && log.source !== logSourceFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.meta && log.meta.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>National Governance & Cloud Control Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">System Administration & Security</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signed in as <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role || 'ADMIN'})
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
        >
          Reset Demo Data Store
        </button>
      </div>

      {/* Demonstration Scenario Configuration */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Active Demonstration Disaster Scenario</span>
          </h2>
          <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/30">
            Regional Operational Simulation
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
                    ? 'bg-amber-50 dark:bg-slate-750 border-amber-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{sc.name}</span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
                <div className="text-amber-700 dark:text-amber-400 font-semibold">{sc.hazardTitle}</div>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                  {sc.scenarioDescription}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AWS Cloud Architecture & Integration Disclosure */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Cloud Infrastructure & Deployed API Endpoints</span>
        </h2>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Live API Endpoint (`VITE_API_BASE_URL`):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate">{apiBase}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">AWS Deployed Region:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{awsRegion} (Asia Pacific - Mumbai)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
            DisasterGuard integrates real AWS serverless primitives: Amazon API Gateway routing, AWS Lambda runtime, DynamoDB tables, and Amazon S3 storage buckets.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>RBAC Security Scopes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Role-Based Access Control enforcing Citizen, Control-Room Authority, NDRF Responder, and Admin privileges.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Amazon DynamoDB Tables</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Provisioned tables: `disaster_incidents`, `disaster_sos`, `disaster_shelters`, `rescue_teams`, `disaster_alerts`.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Amazon S3 & SNS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Presigned S3 URLs for incident evidence attachments; SNS topics for regional emergency broadcasts.
            </p>
          </div>
        </div>
      </div>

      {/* RBAC User Directory */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) User Directory</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{users.length} Active System Identities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 sm:p-4">User</th>
                <th className="p-3 sm:p-4">Assigned Role</th>
                <th className="p-3 sm:p-4">Permissions Scope</th>
                <th className="p-3 sm:p-4 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                  <td className="p-3 sm:p-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-amber-700 dark:text-amber-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-slate-500 dark:text-slate-400 text-[11px]">
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
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
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

      {/* CloudWatch Audit Log Telemetry & Operational Trail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-sm transition-colors">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-sans">
              Operational Audit Trail & AWS CloudWatch Telemetry
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <span>Log Group:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              /aws/lambda/disaster-guard-api
            </span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 font-sans">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search log messages, request IDs..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={logLevelFilter}
              onChange={(e) => setLogLevelFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO Only</option>
              <option value="WARN">WARN Only</option>
              <option value="ERROR">ERROR Only</option>
            </select>

            <select
              value={logSourceFilter}
              onChange={(e) => setLogSourceFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Sources</option>
              <option value="CloudWatch">CloudWatch API Telemetry</option>
              <option value="AuditTrail">Operational Triage Trail</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedNotice ? 'Copied!' : 'Copy Logs'}</span>
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 text-xs font-semibold transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Monospace Log Viewer Terminal */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2 max-h-[360px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">No logs match the current filter criteria.</div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2 text-[11px] leading-relaxed">
                <span className="text-slate-500 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'WARN'
                      ? 'text-amber-400'
                      : log.level === 'ERROR'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="px-1 py-0.2 rounded bg-slate-800 text-[10px] text-blue-300 shrink-0 border border-slate-700">
                  {log.source}
                </span>
                <span className="text-slate-200 flex-1">{log.message}</span>
                {log.meta && (
                  <span className="text-slate-400 text-[10px] font-mono break-all sm:text-right">
                    {log.meta}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
