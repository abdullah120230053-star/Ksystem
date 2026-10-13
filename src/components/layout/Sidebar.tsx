'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  UserCheck,
  CheckSquare,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Tag,
  Settings,
  History,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useKsystem } from '@/context/KsystemContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { settings, unpaidItems } = useKsystem();
  const unpaidCount = unpaidItems.length;

  const links = [
    { href: '/', label: 'لوحة التحكم الرئيسية', icon: Home },
    { href: '/students', label: 'إدارة الطلاب', icon: Users },
    { href: '/families', label: 'دليل العائلات والإخوة', icon: UserCheck },
    { href: '/attendance', label: 'تسجيل الحضور اليومي', icon: CheckSquare },
    { href: '/payments', label: 'إدارة المدفوعات', icon: CreditCard },
    {
      href: '/payments/unpaid',
      label: 'الطلاب غير المسددين',
      icon: AlertTriangle,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
    { href: '/reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
    { href: '/settings/pricing', label: 'خطط الأسعار وعروض الإخوة', icon: Tag },
    { href: '/settings', label: 'إعدادات النظام والكُتّاب', icon: Settings },
    { href: '/audit', label: 'سجل العمليات والتدقيق', icon: History },
  ];

  return (
    <aside
      className="app-sidebar no-print"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-card)',
        display: 'none',
        flexDirection: 'column',
        zIndex: 45,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <style jsx>{`
        @media (min-width: 1024px) {
          aside {
            display: flex !important;
          }
        }
      `}</style>

      {/* Sidebar Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)',
          }}
        >
          <BookOpen size={24} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: 'var(--primary-900)',
              lineHeight: 1.2,
            }}
          >
            {settings.schoolName}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <Sparkles size={12} style={{ color: 'var(--accent-500)' }} />
            <span>نظام سحابي ذكي</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                color: isActive ? 'var(--primary-800)' : 'var(--text-main)',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: 'var(--status-unpaid-text)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                  }}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer User info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-card)',
          backgroundColor: 'var(--slate-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {settings.adminName || 'الشيخ المدير'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            مدير النظام (Admin)
          </div>
        </div>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-500)',
            boxShadow: '0 0 8px var(--primary-400)',
          }}
          title="متصل سحابياً"
        />
      </div>
    </aside>
  );
}
