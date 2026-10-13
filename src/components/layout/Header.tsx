'use client';

import React from 'react';
import Link from 'next/link';
import { useKsystem } from '@/context/KsystemContext';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Calendar, AlertCircle, Shield } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { settings, selectedMonth, setSelectedMonth, unpaidItems } = useKsystem();
  const { currentUser, users, switchUser } = useAuth();

  const unpaidCount = unpaidItems.length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'مدير (Admin)', color: '#15803d', bg: '#dcfce7' };
      case 'teacher':
        return { label: 'معلم (Teacher)', color: '#2563eb', bg: '#dbeafe' };
      default:
        return { label: 'مراقب (Viewer)', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Left / Brand Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)',
              flexShrink: 0,
            }}>
              <BookOpen size={20} />
            </div>

            <div>
              <h1 style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: 'var(--primary-900)',
                lineHeight: 1.2,
              }}>
                {title || settings.schoolName}
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '1px',
              }}>
                {subtitle || 'النظام السحابي لإدارة الطلاب والاشتراكات'}
              </p>
            </div>
          </Link>
        </div>

        {/* Right / Month Selector, User Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Month Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--slate-100)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-card)',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            <Calendar size={14} style={{ color: 'var(--primary-700)' }} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {MONTHS_AR.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Security User Switcher (For live testing RBAC) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: roleInfo.bg,
              color: roleInfo.color,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${roleInfo.color}30`,
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            <Shield size={13} />
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              title="تبديل صلاحيات المستخدم لتجربة الأمان والصلاحيات"
              style={{
                background: 'transparent',
                border: 'none',
                color: roleInfo.color,
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} style={{ color: '#000' }}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Unpaid Alert Badge */}
          {unpaidCount > 0 && (
            <Link
              href="/payments/unpaid"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--status-unpaid-bg)',
                color: 'var(--status-unpaid-text)',
                border: '1px solid var(--status-unpaid-border)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.725rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <AlertCircle size={13} />
              <span>{unpaidCount} غير مسدد</span>
            </Link>
          )}

          {action}
        </div>
      </div>
    </header>
  );
}
