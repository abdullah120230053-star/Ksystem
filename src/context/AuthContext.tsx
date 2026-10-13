'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthUser, INITIAL_SYSTEM_USERS, Permission, hasPermission } from '@/lib/security';

interface AuthContextType {
  currentUser: AuthUser;
  users: AuthUser[];
  isLoading: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<AuthUser, 'id'>) => void;
  deleteUser: (id: string) => void;
  hasPerm: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ksystem_auth_user_v1';
const USERS_STORAGE_KEY = 'ksystem_users_list_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>(INITIAL_SYSTEM_USERS);
  const [currentUser, setCurrentUser] = useState<AuthUser>(INITIAL_SYSTEM_USERS[0]);

  // Synchronize from localStorage on client mount
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) setUsers(JSON.parse(storedUsers));
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to load auth from localStorage', e);
    }
  }, []);

  const isLoading = false;

  const switchUser = useCallback((userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
      }
    }
  }, [users]);

  const login = useCallback((email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.isActive) {
      setCurrentUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      }
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    const viewer = users.find((u) => u.role === 'viewer') || INITIAL_SYSTEM_USERS[2];
    setCurrentUser(viewer);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(viewer));
    }
  }, [users]);

  const addUser = useCallback((userData: Omit<AuthUser, 'id'>) => {
    const newUser: AuthUser = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => {
      const updated = [...prev, newUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteUser = useCallback((id: string) => {
    if (id === 'user-admin') {
      alert('لا يمكن حذف حساب المسؤول الرئيسي');
      return;
    }
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const hasPerm = useCallback((permission: Permission): boolean => {
    return hasPermission(currentUser.role, permission);
  }, [currentUser.role]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        login,
        logout,
        switchUser,
        addUser,
        deleteUser,
        hasPerm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
