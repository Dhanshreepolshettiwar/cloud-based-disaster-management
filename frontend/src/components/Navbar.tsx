import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenSOS: () => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSOS, onOpenReport }) => {
  const { currentUser, switchRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Citizen Portal', path: '/', icon: Flame, allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'] },
    { label: 'Operations Command', path: '/authority', icon: Radio, allowed: ['AUTHORITY', 'ADMIN'] },
    { label: 'Rescue Ops', path: '/rescue', icon: Users, allowed: ['RESCUE_TEAM', 'AUTHORITY', 'ADMIN'] },
    { label: 'Shelters & Resources', path: '/shelters', icon: Home, allowed: ['CITIZEN', 'AUTHORITY', 'RESCUE_TEAM', 'ADMIN'] },
    { label: 'Admin Panel', path: '/admin', icon: Settings, allowed: ['ADMIN'] },
  ];

  const roles: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: 'CITIZEN', label: 'Citizen', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { role: 'AUTHORITY', label: 'Authority Command', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { role: 'RESCUE_TEAM', label: 'Rescue Team', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { role: 'ADMIN', label: 'System Admin', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ];

  const currentBadge = roles.find((r) => r.role === currentUser.role)?.badgeColor || '';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Emergency Notice Top Banner */}
      <div className="bg-red-600/90 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>
            OFFICIAL EMERGENCY HELPLINE: Dial <strong>112</strong> / <strong>911</strong> for immediate life-threatening assistance. This cloud system assists coordination.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                DisasterGuard
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">AWS</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Cloud Disaster Management Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPermitted = item.allowed.includes(currentUser.role);

              if (!isPermitted) return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Report Button */}
            <button
              onClick={onOpenReport}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 transition"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Report Incident
            </button>

            {/* High-Visibility SOS Beacon Button */}
            <button
              onClick={onOpenSOS}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/40 animate-sos transition active:scale-95"
            >
              <Radio className="w-4 h-4 animate-spin" />
              <span>SOS EMERGENCY</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative group">
              <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${currentBadge}`}>
                <UserCheck className="w-3.5 h-3.5" />
                <span>{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1">
                  Switch Active Role (RBAC)
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => switchRole(r.role)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      currentUser.role === r.role ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-700/60 px-3 text-[10px] text-slate-400">
                  Current: {currentUser.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
