'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  Users,
  UserPlus,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from 'lucide-react';

export default function StudentsPage() {
  const { students, families, payments, selectedMonth, selectedYear, settings } = useKsystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const matchSearch =
        s.fullName.includes(searchQuery) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery)) ||
        (s.guardianName && s.guardianName.includes(searchQuery));

      if (!matchSearch) return false;

      // Status
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      // Family
      if (familyFilter !== 'all') {
        if (familyFilter === 'none' && s.familyId !== null) return false;
        if (familyFilter !== 'none' && s.familyId !== familyFilter) return false;
      }

      // Payment Status this month
      if (paymentFilter !== 'all') {
        const familyPayment = s.familyId
          ? payments.find((p) => p.familyId === s.familyId && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear)
          : payments.find((p) => p.familyId === `indiv-${s.id}` && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);

        const isPaid = familyPayment?.paymentStatus === 'paid' || familyPayment?.paymentStatus === 'overpaid';

        if (paymentFilter === 'paid' && !isPaid) return false;
        if (paymentFilter === 'unpaid' && isPaid) return false;
      }

      return true;
    });
  }, [students, searchQuery, statusFilter, familyFilter, paymentFilter, payments, selectedMonth, selectedYear]);

  return (
    <AppLayout
      title="سجل الطلاب"
      subtitle={`إدارة ${students.length} طالب مسجل بالكُتّاب`}
      action={
        <Link
          href="/students/new"
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          <UserPlus size={16} />
          <span>إضافة طالب جديد</span>
        </Link>
      }
    >
      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
          }}
        >
          <style jsx>{`
            @media (min-width: 768px) {
              div {
                grid-template-columns: 2fr 1fr 1fr 1fr !important;
              }
            }
          `}</style>

          {/* Search Box */}
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
              placeholder="ابحث باسم الطالب، الكود، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '38px' }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">كل الحالات (الكل)</option>
            <option value="active">الطلاب النشطون فقط</option>
            <option value="inactive">الطلاب غير النشطين</option>
          </select>

          {/* Payment Filter */}
          <select
            className="input-control"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
          >
            <option value="all">حالة السداد (الكل)</option>
            <option value="paid">المسددون هذا الشهر ✓</option>
            <option value="unpaid">غير المسددين ✗</option>
          </select>

          {/* Family Filter */}
          <select
            className="input-control"
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
          >
            <option value="all">كل العائلات</option>
            <option value="none">طلاب فرديون (بدون عائلة)</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.familyName}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>عدد النتائج: {filteredStudents.length} طالب</span>
          {(searchQuery || statusFilter !== 'active' || paymentFilter !== 'all' || familyFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('active');
                setPaymentFilter('all');
                setFamilyFilter('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-700)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            لم يتم العثور على طلاب مطابقة
          </h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            جرب تعديل كلمات البحث أو الفلاتر المحددة.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '12px',
          }}
        >
          <style jsx>{`
            @media (min-width: 640px) {
              div {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            @media (min-width: 1024px) {
              div {
                grid-template-columns: repeat(3, 1fr) !important;
              }
            }
          `}</style>

          {filteredStudents.map((student) => {
            const family = student.familyId ? families.find((f) => f.id === student.familyId) : undefined;

            // Check payment for this student
            const familyPayment = student.familyId
              ? payments.find((p) => p.familyId === student.familyId && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear)
              : payments.find((p) => p.familyId === `indiv-${student.id}` && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);

            const isPaid = familyPayment?.paymentStatus === 'paid' || familyPayment?.paymentStatus === 'overpaid';
            const isPartial = familyPayment?.paymentStatus === 'partial';

            return (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="card"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--primary-400)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  {/* Top Bar: Code & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--slate-100)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        color: 'var(--slate-700)',
                      }}
                    >
                      {student.studentCode}
                    </span>

                    {/* Paid/Unpaid Badge */}
                    {isPaid ? (
                      <span className="badge badge-paid">
                        <CheckCircle2 size={12} />
                        <span>مسدد لشهر {selectedMonth}</span>
                      </span>
                    ) : isPartial ? (
                      <span className="badge badge-partial">
                        <span>سداد جزئي</span>
                      </span>
                    ) : (
                      <span className="badge badge-unpaid">
                        <XCircle size={12} />
                        <span>غير مسدد</span>
                      </span>
                    )}
                  </div>

                  {/* Student Name & Details */}
                  <div style={{ margin: '6px 0 12px 0' }}>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: 'var(--text-main)',
                        lineHeight: 1.3,
                      }}
                    >
                      {student.fullName}
                    </h3>

                    {/* Family tag */}
                    {family ? (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--primary-800)',
                          fontWeight: 700,
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <UserCheck size={14} />
                        <span>{family.familyName}</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                        }}
                      >
                        طالب مستقل (بدون عائلة)
                      </div>
                    )}

                    {student.notes && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          marginTop: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {student.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-card)',
                      paddingTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      {student.customSubscription
                        ? `اشتراك خاص: ${student.customSubscription} ${settings.currencyName}`
                        : 'اشتراك نظام العائلة'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-700)', fontWeight: 800 }}>
                      <span>الملف</span>
                      <ChevronLeft size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
