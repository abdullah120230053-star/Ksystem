'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import { useKsystem } from '@/context/KsystemContext';
import {
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  ChevronLeft,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function DashboardPage() {
  const {
    dashboardStats,
    settings,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    transactions,
    payments,
    families,
    students,
    unpaidItems,
  } = useKsystem();

  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const monthName = MONTHS_AR[selectedMonth - 1];

  // Unpaid items for direct action on dashboard (up to 4)
  const priorityUnpaid = unpaidItems.slice(0, 4);

  // Recent 4 transactions
  const recentTransactions = transactions.slice(0, 4);

  return (
    <AppLayout
      title={`لوحة التحكم — ${settings.schoolName}`}
      subtitle={`إحصائيات شهر ${monthName} ${selectedYear}`}
    >
      {/* Friendly Welcome & Month Switcher Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary-900), var(--primary-800))',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={24} style={{ color: 'var(--accent-300)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', opacity: 0.9, fontWeight: 700 }}>
              مرحباً بك في نظام الإدارة اليومي
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
              كشف شهر {monthName} {selectedYear}
            </div>
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>تغيير الشهر:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {MONTHS_AR.map((m, idx) => (
              <option key={idx + 1} value={idx + 1} style={{ color: '#000' }}>
                {m} {selectedYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Core Highlight Cards (Simple, clear, and direct) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <style jsx>{`
          @media (min-width: 768px) {
            div {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
        `}</style>

        {/* Card 1: Today's Attendance */}
        <div
          className="card"
          style={{
            borderTop: '4px solid #16a34a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                حضور الطلاب اليوم
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                اليوم الدراسي
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }} suppressHydrationWarning>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d' }}>
                {dashboardStats.todayPresentCount}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                من أصل {dashboardStats.totalStudents} طالب
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }} suppressHydrationWarning>
              {dashboardStats.todayAbsentCount > 0 ? (
                <span style={{ color: '#dc2626', fontWeight: 700 }}>
                  ⚠️ يوجد {dashboardStats.todayAbsentCount} طلاب غائبين
                </span>
              ) : (
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  ✓ جميع الطلاب مسجلين حاضرين
                </span>
              )}
            </div>
          </div>

          <Link
            href="/attendance"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.85rem', padding: '9px 12px' }}
          >
            <span>تسجيل حضور اليوم</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Card 2: Unpaid Students & Debts */}
        <div
          className="card"
          style={{
            borderTop: '4px solid #dc2626',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                غير المسددين هذا الشهر
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                مستحقات معلقة
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }} suppressHydrationWarning>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626' }}>
                {dashboardStats.unpaidStudentsCount}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                طلاب لم يسددوا بعد
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }} suppressHydrationWarning>
              المتبقي للتحصيل:{' '}
              <strong style={{ color: '#dc2626' }}>
                {dashboardStats.totalRemainingRevenue} {settings.currencyName}
              </strong>
            </div>
          </div>

          <Link
            href="/payments/unpaid"
            className="btn"
            style={{
              width: '100%',
              fontSize: '0.85rem',
              padding: '9px 12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontWeight: 800,
            }}
          >
            <span>عرض كشف المتأخرين</span>
            <ChevronLeft size={16} />
          </Link>
        </div>

        {/* Card 3: Monthly Collected Revenue */}
        <div
          className="card"
          style={{
            borderTop: '4px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                المحصل الفعلي بالخزينة
              </span>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                اشتراكات {monthName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }} suppressHydrationWarning>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0369a1' }}>
                {dashboardStats.totalCollectedRevenue.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {settings.currencyName}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }} suppressHydrationWarning>
              من إجمالي متوقع: {dashboardStats.totalExpectedRevenue.toLocaleString()} {settings.currencyName} (
              {Math.round((dashboardStats.totalCollectedRevenue / (dashboardStats.totalExpectedRevenue || 1)) * 100)}%)
            </div>
          </div>

          <Link
            href="/payments/record"
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem', padding: '9px 12px' }}
          >
            <span>تسجيل دفع جديد</span>
            <CreditCard size={16} />
          </Link>
        </div>
      </div>

      {/* Prominent Quick Actions Touch Bar */}
      <QuickActionsBar />

      {/* Priority Action Section: Unpaid Students with Direct Pay Button */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.985rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                مطلوب تحصيل اشتراكاتهم هذا الشهر
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: 0 }}>
                يمكنك التحصيل فوراً بنقرة واحدة
              </p>
            </div>
          </div>

          <Link
            href="/payments/unpaid"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <span>عرض كل المتأخرين ({unpaidItems.length})</span>
            <ChevronLeft size={14} />
          </Link>
        </div>

        {priorityUnpaid.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={28} style={{ color: '#16a34a', margin: '0 auto 6px' }} />
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.925rem' }}>
              ما شاء الله! تم تحصيل جميع اشتراكات هذا الشهر بالكامل
            </div>
            <div style={{ fontSize: '0.785rem', color: '#166534', marginTop: '2px' }}>
              لا توجد أي مبالغ متأخرة على الطلاب أو العائلات.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {priorityUnpaid.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-card)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.925rem' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--slate-200)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {item.type === 'family' ? `${item.studentsCount} طلاب (إخوة)` : 'طالب فردي'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    ولي الأمر: {item.guardianName} {item.phone ? `(${item.phone})` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#dc2626' }}>
                      {item.remainingAmount} {settings.currencyName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>مستحق للسداد</div>
                  </div>

                  <Link
                    href={`/payments/record?${item.type === 'family' ? `familyId=${item.id}` : `studentId=${item.id}`}`}
                    className="btn btn-primary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                    }}
                  >
                    <span>تحصيل الآن</span>
                    <CreditCard size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Payments Log */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>
              آخر عمليات الدفع المسجلة
            </h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: 0 }}>
              متابعة الإيداعات الأخيرة في خزينة الكُتّاب
            </p>
          </div>
          <Link
            href="/payments"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <span>كل المدفوعات</span>
            <ChevronLeft size={14} />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            لا توجد مدفوعات مسجلة بعد لهذا الشهر.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTransactions.map((trx) => {
              const payment = payments.find((p) => p.id === trx.familyPaymentId);
              const family = payment ? families.find((f) => f.id === payment.familyId) : undefined;
              const student = payment?.familyId.startsWith('indiv-')
                ? students.find((s) => `indiv-${s.id}` === payment.familyId)
                : undefined;
              const displayName = family ? family.familyName : (student ? student.fullName : 'سداد اشتراك');

              return (
                <div
                  key={trx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }} suppressHydrationWarning>
                      {trx.paymentMethod === 'cash' ? 'نقدي' : 'تحويل'} • {trx.transactionDate.split('T')[0]}
                    </div>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        color: 'var(--primary-700)',
                      }}
                      suppressHydrationWarning
                    >
                      +{trx.amount} {settings.currencyName}
                    </div>
                    <span className="badge badge-paid" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      تم التحصيل ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expandable Advanced Stats (Keeps dashboard super simple by default) */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button
          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
          className="btn btn-secondary"
          style={{
            fontSize: '0.825rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto',
          }}
        >
          <Layers size={14} />
          <span>{showAdvancedStats ? 'إخفاء الإحصائيات التفصيلية' : 'عرض المزيد من تفاصيل النظام والخصومات'}</span>
          {showAdvancedStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvancedStats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '12px',
              marginTop: '16px',
              textAlign: 'right',
            }}
          >
            <style jsx>{`
              @media (min-width: 600px) {
                div {
                  grid-template-columns: repeat(3, 1fr) !important;
                }
              }
            `}</style>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                إجمالي الأسر المسجلة
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px' }}>
                {families.length} أسر
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                مطبق عليهم عروض وخصومات الإخوة
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                إجمالي خصومات الإخوة
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-500)', marginTop: '4px' }}>
                {dashboardStats.totalDiscountsGiven} {settings.currencyName}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                توفير تلقائي للأسر والعائلات
              </div>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                حالة الطلاب النشطين
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-700)', marginTop: '4px' }}>
                {dashboardStats.activeStudents} طالب
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                منتظمين بالحلقات القرآنية
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
