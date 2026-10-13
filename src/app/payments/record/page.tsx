'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { calculateFamilySubscription } from '@/lib/pricing-engine';
import { PaymentMethod } from '@/types';
import {
  ArrowRight,
  UserCheck,
  CheckCircle2,
  CreditCard,
  Sparkles,
} from 'lucide-react';

function PaymentRecordContent() {
  const searchParams = useSearchParams();
  const initialFamilyId = searchParams.get('familyId') || '';
  const initialStudentId = searchParams.get('studentId') || '';

  const {
    families,
    students,
    pricingPlans,
    payments,
    selectedMonth,
    selectedYear,
    settings,
    recordPayment,
    recordIndividualPayment,
  } = useKsystem();

  const [selectionType, setSelectionType] = useState<'family' | 'student'>(
    initialStudentId ? 'student' : 'family'
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(initialFamilyId);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [month, setMonth] = useState<number>(selectedMonth);
  const [year, setYear] = useState<number>(selectedYear);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // If initial student has a family, auto-select that family
  useEffect(() => {
    if (initialStudentId) {
      const student = students.find((s) => s.id === initialStudentId);
      if (student && student.familyId) {
        setSelectionType('family');
        setSelectedFamilyId(student.familyId);
      }
    }
  }, [initialStudentId, students]);

  // If no family selected yet, select the first active family
  useEffect(() => {
    if (selectionType === 'family' && !selectedFamilyId && families.length > 0) {
      setSelectedFamilyId(families[0].id);
    } else if (selectionType === 'student' && !selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectionType, selectedFamilyId, selectedStudentId, families, students]);

  // Family Calculation
  const familyCalculation = useMemo(() => {
    if (selectionType !== 'family' || !selectedFamilyId) return null;
    const fam = families.find((f) => f.id === selectedFamilyId);
    if (!fam) return null;

    const famStudents = students.filter((s) => s.familyId === selectedFamilyId && s.status === 'active');
    const calc = calculateFamilySubscription(selectedFamilyId, famStudents, pricingPlans, month, year);

    const existingPayment = payments.find(
      (p) => p.familyId === selectedFamilyId && p.paymentMonth === month && p.paymentYear === year
    );

    const alreadyPaid = existingPayment ? existingPayment.paidAmount : 0;
    const remainingToPay = Math.max(0, calc.finalAmount - alreadyPaid);

    return {
      family: fam,
      calc,
      existingPayment,
      alreadyPaid,
      remainingToPay,
    };
  }, [selectionType, selectedFamilyId, families, students, pricingPlans, month, year, payments]);

  // Student Calculation (if individual)
  const studentCalculation = useMemo(() => {
    if (selectionType !== 'student' || !selectedStudentId) return null;
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return null;

    const expected = student.customSubscription || settings.baseSubscription;
    const existingPayment = payments.find(
      (p) => p.familyId === `indiv-${student.id}` && p.paymentMonth === month && p.paymentYear === year
    );

    const alreadyPaid = existingPayment ? existingPayment.paidAmount : 0;
    const remainingToPay = Math.max(0, expected - alreadyPaid);

    return {
      student,
      expected,
      existingPayment,
      alreadyPaid,
      remainingToPay,
    };
  }, [selectionType, selectedStudentId, students, settings.baseSubscription, month, year, payments]);

  // Auto-fill amount with remaining required whenever selection changes
  useEffect(() => {
    if (familyCalculation) {
      setAmount(String(familyCalculation.remainingToPay));
    } else if (studentCalculation) {
      setAmount(String(studentCalculation.remainingToPay));
    }
  }, [familyCalculation, studentCalculation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    if (selectionType === 'family' && selectedFamilyId) {
      recordPayment({
        familyId: selectedFamilyId,
        month,
        year,
        amount: numAmount,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      setIsSuccess(true);
    } else if (selectionType === 'student' && selectedStudentId) {
      recordIndividualPayment({
        studentId: selectedStudentId,
        month,
        year,
        amount: numAmount,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <AppLayout title="تم تسجيل الدفع بنجاح">
        <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px 20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-paid-bg)',
              color: 'var(--status-paid-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-900)' }}>
            تم تسجيل عملية الدفع بنجاح!
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            تم تحديث حالة اشتراك العائلة والإخوة وإدراج العملية في سجل التدقيق.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setIsSuccess(false);
                setNotes('');
              }}
              className="btn btn-primary"
            >
              تسجيل دفعة أخرى
            </button>
            <Link href="/payments" className="btn btn-secondary">
              عرض سجل المدفوعات
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="تسجيل دفع اشتراك شهري"
      subtitle="حساب اشتراك العائلة، وتطبيق عروض الإخوة وتحديث الحالة آلياً"
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/payments"
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
            <span>العودة للمدفوعات</span>
          </Link>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Selection Type Selector */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-card)', paddingBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setSelectionType('family')}
                className={`btn ${selectionType === 'family' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.875rem' }}
              >
                <UserCheck size={16} />
                <span>دفع لعائلة (مجموعة إخوة)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectionType('student')}
                className={`btn ${selectionType === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.875rem' }}
              >
                <span>دفع لطالب مستقل</span>
              </button>
            </div>

            {/* Target Selector */}
            {selectionType === 'family' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  اختر العائلة <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="input-control"
                  value={selectedFamilyId}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.familyName} ({f.guardianName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  اختر الطالب <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="input-control"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month & Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  عن شهر
                </label>
                <select
                  className="input-control"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {[
                    'يناير (1)', 'فبراير (2)', 'مارس (3)', 'إبريل (4)', 'مايو (5)', 'يونيو (6)',
                    'يوليو (7)', 'أغسطس (8)', 'سبتمبر (9)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
                  ].map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  السنة
                </label>
                <select
                  className="input-control"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sibling Calculation Breakdown Card */}
            {familyCalculation && (
              <div
                style={{
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} style={{ color: 'var(--accent-600)' }} />
                    <span>تفاصيل اشتراك العائلة وعرض الإخوة</span>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'var(--primary-200)',
                      color: 'var(--primary-900)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {familyCalculation.calc.siblingCount} إخوة نشطين
                  </span>
                </div>

                {/* Sibling List */}
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)', marginBottom: '12px' }}>
                  الطلاب المشمولون بالدفع: {familyCalculation.calc.activeStudents.map((s) => s.fullName).join(' • ')}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
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
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>السعر الأساسي</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', textDecoration: familyCalculation.calc.discountAmount > 0 ? 'line-through' : 'none' }}>
                      {familyCalculation.calc.normalTotal} {settings.currencyName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-800)' }}>خصم الإخوة</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-600)' }}>
                      {familyCalculation.calc.discountAmount > 0 ? `-${familyCalculation.calc.discountAmount} ${settings.currencyName}` : '0'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary-800)' }}>المطلوب بعد الخصم</div>
                    <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--primary-700)' }}>
                      {familyCalculation.calc.finalAmount} {settings.currencyName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>المسدد مسبقاً</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--slate-600)' }}>
                      {familyCalculation.alreadyPaid} {settings.currencyName}
                    </div>
                  </div>
                </div>

                {familyCalculation.alreadyPaid > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent-800)', fontWeight: 700 }}>
                    متبقي على العائلة: {familyCalculation.remainingToPay} {settings.currencyName}
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                  المبلغ المدفوع الآن <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {familyCalculation && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setAmount(String(familyCalculation.remainingToPay))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-700)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      (سداد كامل المتبقي: {familyCalculation.remainingToPay})
                    </button>
                    {familyCalculation.remainingToPay > 50 && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(Math.round(familyCalculation.remainingToPay / 2)))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-700)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        (نصف المبلغ)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                type="number"
                required
                min="1"
                className="input-control"
                style={{ fontSize: '1.2rem', fontWeight: 900 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ بالجنيه"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                طريقة الدفع
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'cash', label: 'نقدي (كاش)' },
                  { id: 'transfer', label: 'تحويل محفظة' },
                  { id: 'other', label: 'أخرى' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`btn ${paymentMethod === m.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '8px 4px' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                ملاحظات على المعاملة
              </label>
              <textarea
                className="input-control"
                rows={2}
                placeholder="مثال: تم السداد بواسطة والد الطالب نقداً..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '1rem', padding: '12px' }}
              >
                <CreditCard size={18} />
                <span>تأكيد تسجيل الدفع وحفظ العملية</span>
              </button>
              <Link href="/payments" className="btn btn-secondary">
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default function RecordPaymentPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <PaymentRecordContent />
    </Suspense>
  );
}
