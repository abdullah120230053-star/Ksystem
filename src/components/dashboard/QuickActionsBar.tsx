'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, CheckSquare, AlertTriangle, UserPlus } from 'lucide-react';
import { useKsystem } from '@/context/KsystemContext';

export default function QuickActionsBar() {
  const { unpaidItems } = useKsystem();
  const unpaidCount = unpaidItems.length;

  const actions = [
    {
      href: '/attendance',
      label: 'تحضير اليوم',
      desc: 'تسجيل الحضور والغياب بنقرة واحدة',
      icon: CheckSquare,
      color: '#15803d',
      bg: 'rgba(21, 128, 61, 0.08)',
      border: 'rgba(21, 128, 61, 0.2)',
      hoverBorder: '#15803d',
      badge: null,
      featured: true,
    },
    {
      href: '/payments/record',
      label: 'تسجيل دفع اشتراك',
      desc: 'سداد عائلة مع خصم الإخوة',
      icon: CreditCard,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
      border: 'rgba(2, 132, 199, 0.2)',
      hoverBorder: '#0284c7',
      badge: null,
      featured: false,
    },
    {
      href: '/payments/unpaid',
      label: 'الطلاب غير المسددين',
      desc: 'متابعة الديون والتحصيل الفوري',
      icon: AlertTriangle,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.08)',
      border: 'rgba(220, 38, 38, 0.2)',
      hoverBorder: '#dc2626',
      badge: unpaidCount > 0 ? `${unpaidCount} متأخر` : null,
      featured: false,
    },
    {
      href: '/students/new',
      label: 'إضافة طالب جديد',
      desc: 'تسجيل طالب وربطه بأسرته',
      icon: UserPlus,
      color: '#b45309',
      bg: 'rgba(180, 83, 9, 0.08)',
      border: 'rgba(180, 83, 9, 0.2)',
      hoverBorder: '#b45309',
      badge: null,
      featured: false,
    },
  ];

  return (
    <div style={{ margin: '8px 0 24px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            إجراءات سريعة
          </h2>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--primary-700)',
              backgroundColor: 'var(--primary-50)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
            }}
          >
            الأكثر استخداماً
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '12px',
        }}
      >
        <style jsx>{`
          @media (min-width: 600px) {
            div {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (min-width: 1024px) {
            div {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
        `}</style>

        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.href}
              href={act.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: `1.5px solid ${act.border}`,
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: act.color,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 10px ${act.color}40`,
                }}
              >
                <Icon size={22} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.925rem' }}>
                    {act.label}
                  </span>
                  {act.badge && (
                    <span
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.685rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                      }}
                    >
                      {act.badge}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {act.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
