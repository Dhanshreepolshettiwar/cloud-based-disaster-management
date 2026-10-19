import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Globe,
  MapPin,
  Menu,
  X,
  Info,
  LogIn,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, RegionalScenarioId, Language } from '../types';
import { apiService } from '../services/api';
import { translations } from '../services/i18n';

interface NavbarProps {
  onOpenSOS: () => void;
  onOpenReport: () => void;
  onOpenERSS: () => void;
  currentScenario: RegionalScenarioId;
  onScenarioChange: (scenarioId: RegionalScenarioId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSOS,
  onOpenReport,
  onOpenERSS,
  currentScenario,
  onScenarioChange,
  language,
  onLanguageChange,
}) => {
  const { currentUser, isAuthenticated, quickLogin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  // Close interactive dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(event.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSwitchPersona = (role: UserRole) => {
    quickLogin(role);
    setUserMenuOpen(false);
    setDemoMenuOpen(false);
    if (role === 'AUTHORITY') navigate('/authority');
    else if (role === 'RESCUE_TEAM') navigate('/rescue');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  const scenarios = apiService.getAllScenarios();

  const navItems = [
    { label: t.navCitizen, path: '/', icon: Flame, allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'] },
    { label: t.navAuthority, path: '/authority', icon: Radio, allowed: ['AUTHORITY', 'ADMIN'] },
    { label: t.navRescue, path: '/rescue', icon: Users, allowed: ['RESCUE_TEAM', 'AUTHORITY', 'ADMIN'] },
    { label: t.navShelters, path: '/shelters', icon: Home, allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'] },
    { label: t.navAdmin, path: '/admin', icon: Settings, allowed: ['ADMIN'] },
  ];

  const roles: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: 'CITIZEN', label: 'Citizen Responder', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { role: 'AUTHORITY', label: 'Control-Room Operator', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { role: 'RESCUE_TEAM', label: 'Field Responder', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { role: 'ADMIN', label: 'System Administrator', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ];

  const currentBadge = currentUser
    ? roles.find((r) => r.role === currentUser.role)?.badgeColor || ''
    : 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Official Emergency Banner */}
      <div className="bg-red-600/90 text-white px-3 sm:px-4 py-1.5 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse shrink-0 text-amber-200" />
            <span>
              <strong>{t.emergencyHelpline}</strong> — {t.emergencyHelplineSub}
            </span>
          </div>

          <button
            onClick={onOpenERSS}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white transition shrink-0"
          >
            <Info className="w-3 h-3" />
            <span>{t.erssExplainerBtn}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                DisasterGuard
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                National Disaster Management Cloud
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPermitted = currentUser && item.allowed.includes(currentUser.role);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {!isPermitted && item.path !== '/' && item.path !== '/shelters' && (
                    <Lock className="w-3 h-3 text-slate-500 ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Scenario, Language, Actions, Auth */}
          <div className="flex items-center gap-2">
            {/* Regional Scenario Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <select
                value={currentScenario}
                onChange={(e) => onScenarioChange(e.target.value as RegionalScenarioId)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Select Indian Regional Scenario"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('mr')}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === 'mr' ? 'bg-slate-700 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
                title="मराठी (Marathi)"
              >
                मराठी
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === 'hi' ? 'bg-slate-700 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
                title="हिंदी (Hindi)"
              >
                हिंदी
              </button>
            </div>

            {/* Report Button */}
            <button
              onClick={onOpenReport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.reportIncident}</span>
            </button>

            {/* High-Visibility SOS Beacon Button */}
            <button
              onClick={onOpenSOS}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/40 animate-sos transition active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span>SOS</span>
            </button>

            {/* Authentication Control */}
            {isAuthenticated && currentUser ? (
              /* User Profile & Role Switcher Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm ${currentBadge} hover:brightness-110 active:scale-95`}
                  aria-label="Active user identity menu"
                  aria-expanded={userMenuOpen}
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate max-w-[100px] hidden sm:inline">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono uppercase tracking-wider font-extrabold">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50">
                    {/* Account Header */}
                    <div className="px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 mb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Authenticated Account</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="font-bold text-white text-xs mt-1 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {currentUser.role}
                        </span>
                        {currentUser.phoneNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">{currentUser.phoneNumber}</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Access to Active Role Console */}
                    <div className="mb-2">
                      {currentUser.role === 'AUTHORITY' && (
                        <Link
                          to="/authority"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Control-Room Console</span>
                        </Link>
                      )}
                      {currentUser.role === 'RESCUE_TEAM' && (
                        <Link
                          to="/rescue"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>NDRF Rescue Console</span>
                        </Link>
                      )}
                      {currentUser.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>System Admin Governance</span>
                        </Link>
                      )}
                      {currentUser.role === 'CITIZEN' && (
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Citizen Emergency Desk</span>
                        </Link>
                      )}
                    </div>

                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Switch Role (1-Click Demo):
                    </div>

                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {roles.map((r) => (
                        <button
                          key={r.role}
                          onClick={() => handleSwitchPersona(r.role)}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between transition border ${
                            currentUser.role === r.role
                              ? 'bg-slate-800 text-white border-blue-500 shadow-sm'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{r.label.split(' ')[0]}</span>
                          {currentUser.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1">
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In / Register Another Account</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in -> Sign In Button + 1-Click Demo Persona Pill */
              <div className="flex items-center gap-1.5">
                <div className="relative hidden md:block" ref={demoMenuRef}>
                  <button
                    onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                    title="1-Click Demo Persona for Evaluators"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Demo Roles</span>
                    <ChevronDown className="w-3 h-3 text-amber-400" />
                  </button>
                  {demoMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                      <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Instant 1-Click Logins:
                      </div>
                      {roles.map((r) => (
                        <button
                          key={r.role}
                          onClick={() => handleSwitchPersona(r.role)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 transition flex items-center justify-between"
                        >
                          <span>{r.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">({r.role})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-3">
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            <select
              value={currentScenario}
              onChange={(e) => {
                onScenarioChange(e.target.value as RegionalScenarioId);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-transparent text-slate-200 text-xs font-semibold focus:outline-none"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenReport();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.reportIncident}</span>
            </button>
            <button
              onClick={() => {
                onOpenERSS();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Dial 112 Info</span>
            </button>
          </div>

          {/* Mobile Auth button & Quick Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {isAuthenticated && currentUser ? (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentUser.role}
                  </span>
                </div>

                {/* Direct Role console jump */}
                {currentUser.role === 'AUTHORITY' && (
                  <Link
                    to="/authority"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Open Authority Command Console</span>
                  </Link>
                )}
                {currentUser.role === 'RESCUE_TEAM' && (
                  <Link
                    to="/rescue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Open NDRF Rescue Console</span>
                  </Link>
                )}
                {currentUser.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Admin Governance Panel</span>
                  </Link>
                )}

                {/* 1-click quick persona switcher */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Quick Role Switch:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          handleSwitchPersona(r.role);
                          setMobileMenuOpen(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          currentUser.role === r.role
                            ? 'bg-slate-700 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {r.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-blue-400 font-semibold hover:underline"
                  >
                    Switch Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 font-bold text-xs hover:bg-red-600/30 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register Account</span>
                </Link>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>1-Click Evaluator Demo Sign In:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          handleSwitchPersona(r.role);
                          setMobileMenuOpen(false);
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-[10px] font-semibold text-center truncate"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-1 pt-2 border-t border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
