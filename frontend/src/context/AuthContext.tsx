import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultUser: User = {
  userId: 'usr-cit-demo',
  name: 'Dhanshree Citizen',
  email: 'citizen@disasterguard.org',
  role: 'CITIZEN',
  phoneNumber: '+91 98200 99887',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('disaster_current_user');
      return saved ? JSON.parse(saved) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  useEffect(() => {
    localStorage.setItem('disaster_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    let name = 'Citizen User';
    let email = 'citizen@disasterguard.org';

    if (role === 'AUTHORITY') {
      name = 'Commander Sharma (Disaster Control HQ)';
      email = 'authority@disasterguard.org';
    } else if (role === 'RESCUE_TEAM') {
      name = 'Captain Rohit (Charlie Water Rescue)';
      email = 'rescue.lead@disasterguard.org';
    } else if (role === 'ADMIN') {
      name = 'System Administrator';
      email = 'admin@disasterguard.org';
    }

    setCurrentUser({
      userId: `usr-${role.toLowerCase()}-${Date.now().toString(36)}`,
      name,
      email,
      role,
      phoneNumber: '+91 98200 99887',
    });
  };

  const updateUser = (data: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  const logout = () => {
    switchRole('CITIZEN');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        updateUser,
        logout,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
