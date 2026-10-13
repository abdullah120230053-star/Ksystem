'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { calculateFamilySubscription } from '@/lib/pricing-engine';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  CreditCard,
} from 'lucide-react';

export default function FamiliesPage() {
  const {
    families,
    students,
    pricingPlans,
    payments,
    selectedMonth,
    selectedYear,
    settings,
    addFamily,
  } = useKsystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newGuardian, setNewGuardian] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filtered families
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      const match =
        f.familyName.includes(searchQuery) ||
        (f.guardianName && f.guardianName.includes(searchQuery)) ||
        (f.phone && f.phone.includes(searchQuery));
      return match;
    });
  }, [families, searchQuery]);

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) {
      alert('يرجى إدخال اسم العائلة');
      return;
    }
    addFamily({
      familyName: newFamilyName.trim(),
      guardianName: newGuardian.trim() || newFamilyName.trim(),
      phone: newPhone.trim(),
      notes: newNotes.trim() || undefined,
      isActive: true,
    });
    setNewFamilyName('');
    setNewGuardian('');
    setNewPhone('');
    setNewNotes('');
    setIsAddingFamily(false);
  };

  return (
    <AppLayout
      title="دليل العائلات ومجموعات الإخوة"
      subtitle={`إدارة ${families.length} عائلة مسجلة وحساب عروض الإخوة`}
      action={
        <button
          onClick={() => setIsAddingFamily(!isAddingFamily)}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          <span>إضافة عائلة جديدة</span>
        </button>
      }
    >
      {/* Quick Add Family Modal/Card if toggled */}
      {isAddingFamily && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary-600)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
            إنشاء عائلة جديدة
          </h3>
          <form onSubmit={handleCreateFamily} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <style jsx>{`
                @media (min-width: 600px) {
                  div {
                    grid-template-columns: 1fr 1fr 1fr !important;
                  }
                }
              `}</style>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  اسم العائلة *
                </label>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="مثال: عائلة محمد أحمد"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  اسم ولي الأمر
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="مثال: محمد أحمد إبراهيم"
                  value={newGuardian}
                  onChange={(e) => setNewGuardian(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="input-control"
                  placeholder="010XXXXXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                حفظ العائلة
              </button>
              <button
                type="button"
                onClick={() => setIsAddingFamily(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
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
            placeholder="ابحث باسم العائلة، ولي الأمر، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingRight: '38px' }}
          />
        </div>
      </div>

      {/* Families Grid */}
      {filteredFamilies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <UserCheck size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3>لم يتم العثور على عائلات مطابقة</h3>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '14px',
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

          {filteredFamilies.map((family) => {
            const familyStudents = students.filter((s) => s.familyId === family.id && s.status === 'active');
            const calc = calculateFamilySubscription(family.id, familyStudents, pricingPlans, selectedMonth, selectedYear);

            const payment = payments.find(
              (p) => p.familyId === family.id && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear
            );

            const isPaid = payment?.paymentStatus === 'paid' || payment?.paymentStatus === 'overpaid';
            const isPartial = payment?.paymentStatus === 'partial';

            return (
              <div
                key={family.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar */}
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
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-900)',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Users size={13} />
                      <span>{familyStudents.length} إخوة مسجلين</span>
                    </span>

                    {/* Payment Badge */}
                    {isPaid ? (
                      <span className="badge badge-paid">
                        <CheckCircle2 size={12} />
                        <span>مسدد بالكامل ✓</span>
                      </span>
                    ) : isPartial ? (
                      <span className="badge badge-partial">
                        <span>سداد جزئي ({payment?.paidAmount}/{calc.finalAmount})</span>
                      </span>
                    ) : (
                      <span className="badge badge-unpaid">
                        <XCircle size={12} />
                        <span>مطلوب {calc.finalAmount} {settings.currencyName}</span>
                      </span>
                    )}
                  </div>

                  {/* Family Title & Guardian */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                    {family.familyName}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ولي الأمر: {family.guardianName || 'غير مسجل'}
                  </div>

                  {family.phone && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={13} />
                      <span>{family.phone}</span>
                    </div>
                  )}

                  {/* Sibling Names Chips */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الطلاب المنتسبون:
                    </div>
                    {familyStudents.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>لا يوجد طلاب نشطين حالياً</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {familyStudents.map((s) => (
                          <span
                            key={s.id}
                            style={{
                              backgroundColor: 'var(--slate-100)',
                              color: 'var(--text-main)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                            }}
                          >
                            {s.fullName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Calculation Box */}
                  <div
                    style={{
                      marginTop: '14px',
                      backgroundColor: 'var(--slate-50)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>اشتراك شهر {selectedMonth}:</div>
                      <div style={{ fontWeight: 800, color: 'var(--primary-900)' }}>
                        {calc.finalAmount} {settings.currencyName}
                      </div>
                    </div>

                    {calc.discountAmount > 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--accent-100)',
                          color: 'var(--accent-800)',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        خصم {calc.discountAmount} {settings.currencyName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-card)',
                  }}
                >
                  <Link
                    href={`/families/${family.id}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px', minHeight: '34px' }}
                  >
                    <span>تفاصيل العائلة</span>
                    <ChevronLeft size={14} />
                  </Link>

                  <Link
                    href={`/payments/record?familyId=${family.id}`}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }}
                    title="تسجيل دفع فوري"
                  >
                    <CreditCard size={15} />
                    <span>دفع</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
