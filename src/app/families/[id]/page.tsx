'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { calculateFamilySubscription } from '@/lib/pricing-engine';
import {
  ArrowRight,
  Users,
  UserPlus,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  Trash2,
  Calendar,
} from 'lucide-react';

export default function FamilyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const familyId = resolvedParams.id;
  const router = useRouter();

  const {
    getFamily,
    getFamilyStudents,
    pricingPlans,
    payments,
    selectedMonth,
    selectedYear,
    settings,
    deleteFamily,
  } = useKsystem();

  const family = getFamily(familyId);

  if (!family) {
    return (
      <AppLayout title="العائلة غير موجودة">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertTriangle size={48} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h2>عذراً، لم يتم العثور على هذه العائلة!</h2>
          <Link href="/families" className="btn btn-primary" style={{ marginTop: '16px' }}>
            العودة لدليل العائلات
          </Link>
        </div>
      </AppLayout>
    );
  }

  const siblings = getFamilyStudents(family.id);
  const activeSiblings = siblings.filter((s) => s.status === 'active');

  // Calculate pricing for selected month
  const calc = calculateFamilySubscription(family.id, activeSiblings, pricingPlans, selectedMonth, selectedYear);

  // Payment record for this month
  const currentPayment = payments.find(
    (p) => p.familyId === family.id && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear
  );

  const isPaid = currentPayment?.paymentStatus === 'paid' || currentPayment?.paymentStatus === 'overpaid';
  const isPartial = currentPayment?.paymentStatus === 'partial';

  // Family payment history (all recorded payments)
  const familyPaymentsHistory = payments
    .filter((p) => p.familyId === family.id)
    .sort((a, b) => b.paymentYear - a.paymentYear || b.paymentMonth - a.paymentMonth);

  const handleDeleteFamily = () => {
    if (confirm(`هل أنت متأكد من حذف ${family.familyName}؟ سيتم فك ارتباط الطلاب دون حذفهم.`)) {
      deleteFamily(family.id);
      router.push('/families');
    }
  };

  return (
    <AppLayout
      title={family.familyName}
      subtitle={`ولي الأمر: ${family.guardianName} • عدد الإخوة: ${siblings.length}`}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Link
            href="/families"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ArrowRight size={16} />
            <span>العودة لدليل العائلات</span>
          </Link>

          <button
            onClick={handleDeleteFamily}
            className="btn btn-secondary"
            style={{ color: '#dc2626', padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }}
          >
            <Trash2 size={14} />
            <span>حذف العائلة</span>
          </button>
        </div>

        {/* Family Header Card */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-900)',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.785rem',
                  }}
                >
                  {activeSiblings.length} إخوة نشطين بالكُتّاب
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {family.familyName}
              </h2>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                ولي الأمر: <strong>{family.guardianName}</strong>
              </div>

              {family.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Phone size={14} />
                  <span>{family.phone}</span>
                </div>
              )}
            </div>

            {/* Quick Sibling Add Link */}
            <Link
              href={`/students/new?familyId=${family.id}`}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.825rem' }}
            >
              <UserPlus size={15} />
              <span>إضافة أخ جديد للعائلة</span>
            </Link>
          </div>
        </div>

        {/* Core Calculation Breakdown for Current Month */}
        <div
          className="card"
          style={{
            marginBottom: '16px',
            border: '2px solid var(--primary-700)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-900)' }}>
                حساب اشتراك شهر {selectedMonth} / {selectedYear}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                تطبيق عروض الإخوة آلياً حسب عدد الطلاب النشطين
              </p>
            </div>

            {isPaid ? (
              <span className="badge badge-paid" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                <CheckCircle2 size={16} />
                <span>تم السداد بالكامل ✓</span>
              </span>
            ) : isPartial ? (
              <span className="badge badge-partial" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                <span>سداد جزئي ({currentPayment?.paidAmount} من {calc.finalAmount})</span>
              </span>
            ) : (
              <span className="badge badge-unpaid" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                <XCircle size={16} />
                <span>غير مسدد ({calc.finalAmount} {settings.currencyName})</span>
              </span>
            )}
          </div>

          {/* Numbers Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              backgroundColor: 'var(--slate-50)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
            }}
          >
            <style jsx>{`
              @media (min-width: 600px) {
                div {
                  grid-template-columns: repeat(4, 1fr) !important;
                }
              }
            `}</style>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>عدد الإخوة النشطين</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {calc.siblingCount} طلاب
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>السعر العادي الإجمالي</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--slate-600)', textDecoration: calc.discountAmount > 0 ? 'line-through' : 'none' }}>
                {calc.normalTotal} {settings.currencyName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-800)', fontWeight: 700 }}>خصم عرض الإخوة</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-600)' }}>
                {calc.discountAmount > 0 ? `-${calc.discountAmount} ${settings.currencyName}` : 'لا يوجد خصم'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 700 }}>المطلوب بعد الخصم</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                {calc.finalAmount} {settings.currencyName}
              </div>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>المدفوع: {currentPayment ? currentPayment.paidAmount : 0} {settings.currencyName}</span>
              <span>المتبقي: {Math.max(0, calc.finalAmount - (currentPayment ? currentPayment.paidAmount : 0))} {settings.currencyName}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-200)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${calc.finalAmount > 0 ? Math.min(100, ((currentPayment?.paidAmount || 0) / calc.finalAmount) * 100) : 100}%`,
                  backgroundColor: isPaid ? 'var(--status-paid-text)' : 'var(--accent-500)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Record Payment Button */}
          <Link
            href={`/payments/record?familyId=${family.id}`}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.95rem', padding: '12px' }}
          >
            <CreditCard size={18} />
            <span>تسجيل دفعة جديدة لشهر {selectedMonth}</span>
          </Link>
        </div>

        {/* Siblings List */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--primary-700)' }} />
            <span>قائمة الإخوة المنتسبين للعائلة ({siblings.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {siblings.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.925rem' }}>{student.fullName}</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--slate-200)', padding: '2px 6px', borderRadius: '4px' }}>
                      {student.studentCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {student.notes || 'طالب بالكُتّاب'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: student.status === 'active' ? 'var(--status-present-bg)' : 'var(--slate-200)',
                      color: student.status === 'active' ? 'var(--status-present-text)' : 'var(--slate-600)',
                    }}
                  >
                    {student.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>

                  <Link
                    href={`/students/${student.id}`}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', minHeight: '30px' }}
                  >
                    <span>الملف</span>
                    <ChevronLeft size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
            <span>سجل مدفوعات العائلة السابقة</span>
          </h3>

          {familyPaymentsHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              لا توجد مدفوعات مسجلة لهذه العائلة حتى الآن.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {familyPaymentsHistory.map((p) => {
                const paid = p.paymentStatus === 'paid';
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--border-card)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        اشتراك شهر {p.paymentMonth} / {p.paymentYear}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        المطلوب: {p.finalAmount} {settings.currencyName} • الخصم: {p.discountAmount} {settings.currencyName}
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 900, color: 'var(--primary-700)' }}>
                        المدفوع: {p.paidAmount} {settings.currencyName}
                      </div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: paid ? 'var(--status-paid-bg)' : 'var(--status-partial-bg)',
                          color: paid ? 'var(--status-paid-text)' : 'var(--status-partial-text)',
                          fontSize: '0.7rem',
                        }}
                      >
                        {paid ? 'مدفوع بالكامل ✓' : `متبقي ${p.remainingAmount} ${settings.currencyName}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
