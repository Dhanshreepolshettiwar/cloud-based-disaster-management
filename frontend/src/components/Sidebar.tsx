import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Radio,
  Users,
  Home,
  Settings,
  PhoneCall,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  MapPin,
  Sparkles,
  Lock,
  Moon,
  Sun,
  Globe,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole, RegionalScenarioId, Language } from '../types';
import { apiService } from '../services/api';
import { translations } from '../services/i18n';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onOpenSOS: () => void;
  onOpenReport: () => void;
  onOpenERSS: () => void;
  currentScenario: RegionalScenarioId;
  onScenarioChange: (scenarioId: RegionalScenarioId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onOpenSOS,
  onOpenReport,
  onOpenERSS,
  currentScenario,
  onScenarioChange,
  language,
  onLanguageChange,
}) => {
  const { currentUser, isAuthenticated, quickLogin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const t = translations[language] || translations.en;
  const scenarios = apiService.getAllScenarios();
  const activeScenario = apiService.getActiveScenario();

  const handleSwitchPersona = (role: UserRole) => {
    quickLogin(role);
    onMobileClose();
    if (role === 'AUTHORITY') navigate('/authority');
    else if (role === 'RESCUE_TEAM') navigate('/rescue');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  const navGroups = [
    {
      title: 'Emergency Services',
      items: [
        {
          label: t.navCitizen,
          path: '/',
          icon: Flame,
          allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'],
        },
        {
          label: t.navAuthority,
          path: '/authority',
          icon: Radio,
          allowed: ['AUTHORITY', 'ADMIN'],
        },
        {
          label: t.navRescue,
          path: '/rescue',
          icon: Users,
          allowed: ['RESCUE_TEAM', 'AUTHORITY', 'ADMIN'],
        },
      ],
    },
    {
      title: 'Operations & Facilities',
      items: [
        {
          label: t.navShelters,
          path: '/shelters',
          icon: Home,
          allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'],
        },
        {
          label: t.navAdmin,
          path: '/admin',
          icon: Settings,
          allowed: ['ADMIN'],
        },
      ],
    },
  ];

  const roles: { role: UserRole; label: string; short: string; badgeColor: string }[] = [
    { role: 'CITIZEN', label: 'Citizen Responder', short: 'Citizen', badgeColor: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/30' },
    { role: 'AUTHORITY', label: 'Control Room Officer', short: 'Authority', badgeColor: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30' },
    { role: 'RESCUE_TEAM', label: 'NDRF Field Team', short: 'Rescue', badgeColor: 'bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/30' },
    { role: 'ADMIN', label: 'System Admin', short: 'Admin', badgeColor: 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border-purple-500/30' },
  ];

  const currentRoleInfo = currentUser
    ? roles.find((r) => r.role === currentUser.role)
    : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 select-none transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <Link
          to="/"
          onClick={onMobileClose}
          className="flex items-center gap-3 overflow-hidden group"
          title="DisasterGuard India"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>

          {(!isCollapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <div className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5 truncate">
                <span>DisasterGuard</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-red-100 dark:bg-slate-800 text-red-600 dark:text-amber-400 border border-red-200 dark:border-slate-700 font-bold">
                  IN
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Disaster Ops Command
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Regional Scenario Context Badge */}
      {(!isCollapsed || mobileOpen) && (
        <div className="px-3.5 py-2.5 mx-3 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" />
              Scenario
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <select
            value={currentScenario}
            onChange={(e) => onScenarioChange(e.target.value as RegionalScenarioId)}
            className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
            title="Select Regional Disaster Scenario"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {(!isCollapsed || mobileOpen) && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPermitted = currentUser && item.allowed.includes(currentUser.role);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  title={isCollapsed && !mobileOpen ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-500'}`} />
                  {(!isCollapsed || mobileOpen) && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {(!isCollapsed || mobileOpen) && !isPermitted && item.path !== '/' && item.path !== '/shelters' && (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Quick Emergency Actions */}
        <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
          {(!isCollapsed || mobileOpen) && (
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Quick Triggers
            </div>
          )}

          {/* SOS Beacon Button */}
          <button
            onClick={() => {
              onOpenSOS();
              onMobileClose();
            }}
            title="Transmit SOS Distress Beacon"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-600/30 animate-sos transition active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>TRANSMIT SOS</span>}
          </button>

          {/* Report Incident Button */}
          <button
            onClick={() => {
              onOpenReport();
              onMobileClose();
            }}
            title="Report Disaster Hazard"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs transition active:scale-95"
          >
            <Flame className="w-4 h-4 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>Report Hazard</span>}
          </button>

          {/* Dial 112 Explainer Button */}
          <button
            onClick={() => {
              onOpenERSS();
              onMobileClose();
            }}
            title="Dial 112 ERSS Guide"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
          >
            <PhoneCall className="w-4 h-4 shrink-0 text-red-500" />
            {(!isCollapsed || mobileOpen) && <span>Dial 112 Info</span>}
          </button>
        </div>
      </div>

      {/* User Session & Role Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0 space-y-2">
        {isAuthenticated && currentUser ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentRoleInfo?.label || currentUser.role}
                  </div>
                </div>
              )}
            </div>

            {(!isCollapsed || mobileOpen) && (
              <div className="pt-1.5 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    logout();
                    onMobileClose();
                    navigate('/');
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <Link
                  to="/login"
                  onClick={onMobileClose}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Switch User
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              onClick={onMobileClose}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
              title="Sign In"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {(!isCollapsed || mobileOpen) && <span>Sign In</span>}
            </Link>
          </div>
        )}

        {/* 1-Click Demo Persona Switcher (when expanded) */}
        {(!isCollapsed || mobileOpen) && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Demo Role Switcher:</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleSwitchPersona(r.role)}
                  className={`px-2 py-1 rounded-lg border text-left truncate transition ${
                    currentUser?.role === r.role
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-400 font-bold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                  title={r.label}
                >
                  {r.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:flex items-center justify-between pt-1">
          <button
            onClick={onToggleCollapse}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
        style={{ width: isCollapsed ? '72px' : '260px' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
