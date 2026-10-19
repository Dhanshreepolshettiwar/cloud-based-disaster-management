import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  PhoneCall,
  Sun,
  Moon,
  Radio,
  Flame,
  UserCheck,
  ChevronDown,
  Cloud,
  CheckCircle,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Language, UserRole } from '../types';
import { translations } from '../services/i18n';

interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSOS: () => void;
  onOpenReport: () => void;
  onOpenERSS: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSOS,
  onOpenReport,
  onOpenERSS,
  language,
  onLanguageChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isAuthenticated, quickLogin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Citizen Emergency Portal', section: 'Public Safety' };
      case '/authority':
        return { title: 'Disaster Operations Command', section: 'Triage & Control Room' };
      case '/rescue':
        return { title: 'Field Responder Console', section: 'NDRF Rescue Ops' };
      case '/shelters':
        return { title: 'Emergency Shelters & Supplies', section: 'Relief Logistics' };
      case '/admin':
        return { title: 'Governance & Cloud Admin', section: 'Infrastructure' };
      case '/login':
        return { title: 'Identity & Authentication', section: 'Security' };
      default:
        return { title: 'Disaster Coordination', section: 'Platform' };
    }
  };

  const pageInfo = getPageTitle();

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: 'CITIZEN', label: 'Citizen Responder', badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    { role: 'AUTHORITY', label: 'Control Room Officer', badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
    { role: 'RESCUE_TEAM', label: 'NDRF Field Team', badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    { role: 'ADMIN', label: 'System Admin', badge: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    quickLogin(role);
    setUserMenuOpen(false);
    if (role === 'AUTHORITY') navigate('/authority');
    else if (role === 'RESCUE_TEAM') navigate('/rescue');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  const isAwsConfigured = Boolean(import.meta.env.VITE_API_BASE_URL);

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
        {/* Left Section: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{pageInfo.section}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                <Cloud className="w-3 h-3" />
                {isAwsConfigured ? 'AWS ap-south-1 Live' : 'Simulation'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Section: Emergency Helpline, Quick Actions, Theme, Language, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dial 112 Helpline Pill */}
          <button
            onClick={onOpenERSS}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-600/40 text-[11px] font-bold text-red-700 dark:text-red-300 transition"
            title="Emergency Response Support System (112)"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-red-600 dark:text-red-400" />
            <span>Dial 112 (ERSS)</span>
          </button>

          {/* Quick SOS Trigger in Header */}
          <button
            onClick={onOpenSOS}
            className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md animate-sos transition"
            title="Send Emergency SOS"
          >
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>SOS</span>
          </button>

          {/* Language Switcher Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded transition ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('mr')}
              className={`px-2 py-0.5 rounded transition ${
                language === 'mr'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="मराठी (Marathi)"
            >
              मराठी
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-0.5 rounded transition ${
                language === 'hi'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="हिंदी (Hindi)"
            >
              हिंदी
            </button>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Auth Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated && currentUser ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold transition hover:bg-slate-200 dark:hover:bg-slate-750"
                aria-expanded={userMenuOpen}
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  {currentUser.role.split('_')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* User Dropdown Menu */}
            {userMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Identity Session</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                  <div className="mt-1.5 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">
                    Role: {currentUser.role}
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                  1-Click Role Switch:
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`px-2 py-1.5 rounded-lg border text-left text-[11px] transition ${
                        currentUser.role === r.role
                          ? 'bg-blue-50 dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {r.label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Switch Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                      navigate('/');
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
