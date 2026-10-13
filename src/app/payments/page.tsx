'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { Plus, Search, History } from 'lucide-react';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function PaymentsPage() {
  const {
    payments,
    transactions,
    families,
    students,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    dashboardStats,
    settings,
  } = useKsystem();

  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const monthName = MONTHS_AR[selectedMonth - 1];

  // Payments for current month
  const currentMonthPayments = payments.filter(
    (p) => p.paymentMonth === selectedMonth && p.paymentYear === selectedYear
  );

  const filteredPayments = currentMonthPayments.filter((p) => {
    if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) return false;

    const family = families.find((f) => f.id === p.familyId);
    const student = p.familyId.startsWith('indiv-')
      ? students.find((s) => `indiv-${s.id}` === p.familyId)
      : undefined;

    const name = family ? family.familyName : student ? student.fullName : '';
    if (searchQuery && !name.includes(searchQuery)) return false;

    return true;
  });

  return (
    <AppLayout
      title="إدارة المدفوعات والاشتراكات"
      subtitle={`سجل اشتراكات شهر ${monthName} ${selectedYear}`}
      action={
        <Link
          href="/payments/record"
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          <span>تسجيل دفع جديد</span>
        </Link>
      }
    >
      {/* Financial Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <style jsx>{`
          @media (min-width: 600px) {
            div {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
        `}</style>

        <div className="card" style={{ backgroundColor: 'var(--slate-50)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>الإيراد المتوقع (بعد الخصم)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {dashboardStats.totalExpectedRevenue.toLocaleString()} {settings.currencyName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-700)', marginTop: '4px' }}>
            تم منح خصومات إخوة: {dashboardStats.totalDiscountsGiven.toLocaleString()} {settings.currencyName}
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'var(--status-paid-bg)', borderColor: 'var(--status-paid-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--status-paid-text)', fontWeight: 700 }}>المحصل الفعلي بالخزينة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-paid-text)', marginTop: '4px' }}>
            {dashboardStats.totalCollectedRevenue.toLocaleString()} {settings.currencyName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-paid-text)', marginTop: '4px' }}>
            معدل التحصيل: {Math.round((dashboardStats.totalCollectedRevenue / (dashboardStats.totalExpectedRevenue || 1)) * 100)}%
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'var(--status-unpaid-bg)', borderColor: 'var(--status-unpaid-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--status-unpaid-text)', fontWeight: 700 }}>المتبقي تحصيله</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-unpaid-text)', marginTop: '4px' }}>
            {dashboardStats.totalRemainingRevenue.toLocaleString()} {settings.currencyName}
          </div>
          <Link
            href="/payments/unpaid"
            style={{ fontSize: '0.75rem', color: 'var(--status-unpaid-text)', fontWeight: 800, marginTop: '4px', display: 'inline-block' }}
          >
            عرض كشف غير المسددين ←
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <style jsx>{`
            @media (min-width: 600px) {
              div {
                grid-template-columns: 2fr 1fr 1fr !important;
              }
            }
          `}</style>

          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-control"
              placeholder="ابحث باسم العائلة أو الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '38px' }}
            />
          </div>

          <select
            className="input-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">كل حالات السداد</option>
            <option value="paid">مسدد بالكامل ✓</option>
            <option value="partial">سداد جزئي</option>
            <option value="unpaid">غير مسدد ✗</option>
          </select>

          <select
            className="input-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS_AR.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                شهر {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Records List */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>
          سجلات اشتراكات شهر {monthName} ({filteredPayments.length})
        </h3>

        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            لا توجد سجلات مطابقة لهذا الشهر والفلاتر المحددة.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredPayments.map((p) => {
              const family = families.find((f) => f.id === p.familyId);
              const student = p.familyId.startsWith('indiv-')
                ? students.find((s) => `indiv-${s.id}` === p.familyId)
                : undefined;

              const title = family ? family.familyName : student ? student.fullName : 'سجل دفع';
              const isPaid = p.paymentStatus === 'paid' || p.paymentStatus === 'overpaid';
              const isPartial = p.paymentStatus === 'partial';

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-card)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{title}</span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isPaid ? 'var(--status-paid-bg)' : isPartial ? 'var(--status-partial-bg)' : 'var(--status-unpaid-bg)',
                          color: isPaid ? 'var(--status-paid-text)' : isPartial ? 'var(--status-partial-text)' : 'var(--status-unpaid-text)',
                        }}
                      >
                        {isPaid ? 'مدفوع بالكامل ✓' : isPartial ? 'سداد جزئي' : 'لم يسدد'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      المطلوب: {p.finalAmount} {settings.currencyName} • الخصم المطبق: {p.discountAmount} {settings.currencyName}
                      {p.notes && ` • (${p.notes})`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--primary-700)' }}>
                        المحصل: {p.paidAmount} {settings.currencyName}
                      </div>
                      {p.remainingAmount > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                          متبقي: {p.remainingAmount} {settings.currencyName}
                        </div>
                      )}
                    </div>

                    <Link
                      href={family ? `/payments/record?familyId=${family.id}` : `/payments/record?studentId=${student?.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '32px' }}
                    >
                      تسجيل دفعة
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transactions History Stream */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} style={{ color: 'var(--primary-700)' }} />
          <span>سجل الحركات المالية المكتملة</span>
        </h3>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
            لا توجد حركات مسجلة.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.slice(0, 8).map((trx) => (
              <div
                key={trx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-card)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {trx.transactionType === 'payment' ? 'تحصيل اشتراك' : 'تعديل أو إلغاء'} • {trx.paymentMethod === 'cash' ? 'نقدي' : 'تحويل'}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    بواسطة: {trx.recordedByName} • التاريخ: {new Date(trx.transactionDate).toLocaleString('ar-EG')}
                    {trx.notes && ` • ${trx.notes}`}
                  </div>
                </div>

                <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary-700)' }}>
                  +{trx.amount} {settings.currencyName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
