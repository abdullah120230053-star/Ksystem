'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, CreditCard, BarChart3 } from 'lucide-react';
import { useKsystem } from '@/context/KsystemContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { unpaidItems } = useKsystem();
  const unpaidCount = unpaidItems.length;

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/students', label: 'الطلاب', icon: Users },
    { href: '/attendance', label: 'الحضور', icon: CheckSquare },
    {
      href: '/payments',
      label: 'المدفوعات',
      icon: CreditCard,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
    { href: '/reports', label: 'التقارير', icon: BarChart3 },
  ];

  return (
    <nav
      className="bottom-nav no-print"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-height)',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-card)',
        boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        padding: '0 8px',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flex: 1,
              height: '100%',
              color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
              position: 'relative',
              transition: 'all 0.2s ease',
              padding: '6px 2px',
            }}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  backgroundColor: 'var(--primary-700)',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}

            <div
              style={{
                position: 'relative',
                padding: '4px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.9} />
              {item.badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-4px',
                    backgroundColor: 'var(--status-unpaid-text)',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: isActive ? 800 : 500,
                marginTop: '2px',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
