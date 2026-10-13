'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { ArrowRight, PlusCircle, Check } from 'lucide-react';

function NewStudentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFamilyId = searchParams.get('familyId') || '';
  const { families, addStudent, addFamily } = useKsystem();

  const [fullName, setFullName] = useState('');
  const [familyId, setFamilyId] = useState<string>(initialFamilyId);
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [customSubscription, setCustomSubscription] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Pre-fill guardian and phone if familyId was passed via URL query
  useEffect(() => {
    if (initialFamilyId) {
      const fam = families.find((f) => f.id === initialFamilyId);
      if (fam) {
        setFamilyId(fam.id);
        if (fam.guardianName) setGuardianName(fam.guardianName);
        if (fam.phone) setPhone(fam.phone);
      }
    }
  }, [initialFamilyId, families]);

  // Inline new family state
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyGuardian, setNewFamilyGuardian] = useState('');
  const [newFamilyPhone, setNewFamilyPhone] = useState('');

  const handleCreateNewFamily = () => {
    if (!newFamilyName.trim()) {
      alert('يرجى إدخال اسم العائلة');
      return;
    }
    const created = addFamily({
      familyName: newFamilyName.trim(),
      guardianName: newFamilyGuardian.trim() || newFamilyName.trim(),
      phone: newFamilyPhone.trim(),
      isActive: true,
      notes: 'تمت إضافتها مع الطالب',
    });
    setFamilyId(created.id);
    setIsCreatingFamily(false);
    if (!guardianName && newFamilyGuardian) setGuardianName(newFamilyGuardian);
    if (!phone && newFamilyPhone) setPhone(newFamilyPhone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('يرجى إدخال اسم الطالب كاملاً');
      return;
    }

    const created = addStudent({
      fullName: fullName.trim(),
      familyId: familyId ? familyId : null,
      guardianName: guardianName.trim() || undefined,
      phone: phone.trim() || undefined,
      customSubscription: customSubscription ? Number(customSubscription) : null,
      joinDate,
      leaveDate: null,
      status,
      notes: notes.trim() || undefined,
    });

    router.push(`/students/${created.id}`);
  };

  return (
    <AppLayout
      title="إضافة طالب جديد"
      subtitle="تسجيل طالب جديد وربطه بعائلة أو تسجيله كطالب مستقل"
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/students"
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
            <span>العودة لقائمة الطلاب</span>
          </Link>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Student Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                اسم الطالب الكامل <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="مثال: أحمد محمد علي"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Family Selection & Quick Add */}
            <div style={{ backgroundColor: 'var(--slate-50)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                  العائلة / مجموعة الإخوة (Family Group)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingFamily(!isCreatingFamily)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-700)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>{isCreatingFamily ? 'اختيار من العائلات الحالية' : 'إنشاء عائلة جديدة'}</span>
                </button>
              </div>

              {isCreatingFamily ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="اسم العائلة (مثال: عائلة محمد أحمد)"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="اسم ولي الأمر"
                      value={newFamilyGuardian}
                      onChange={(e) => setNewFamilyGuardian(e.target.value)}
                    />
                    <input
                      type="tel"
                      className="input-control"
                      placeholder="رقم الهاتف"
                      value={newFamilyPhone}
                      onChange={(e) => setNewFamilyPhone(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewFamily}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    حفظ واختيار هذه العائلة
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    className="input-control"
                    value={familyId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFamilyId(val);
                      if (val) {
                        const fam = families.find((f) => f.id === val);
                        if (fam) {
                          if (!guardianName) setGuardianName(fam.guardianName);
                          if (!phone) setPhone(fam.phone);
                        }
                      }
                    }}
                  >
                    <option value="">طالب فردي (بدون مجموعة إخوة حالياً)</option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.familyName} ({f.guardianName})
                      </option>
                    ))}
                  </select>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ربط الطالب بعائلة يفعل عروض الإخوة وتجميع المدفوعات آلياً.
                  </span>
                </div>
              )}
            </div>

            {/* Guardian & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <style jsx>{`
                @media (min-width: 600px) {
                  div {
                    grid-template-columns: 1fr 1fr !important;
                  }
                }
              `}</style>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  اسم ولي الأمر
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="اختياري"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  رقم الهاتف للتواصل
                </label>
                <input
                  type="tel"
                  className="input-control"
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Custom Subscription & Join Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <style jsx>{`
                @media (min-width: 600px) {
                  div {
                    grid-template-columns: 1fr 1fr !important;
                  }
                }
              `}</style>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  اشتراك مخصص (استثناء)
                </label>
                <input
                  type="number"
                  className="input-control"
                  placeholder="اتركه فارغاً لاعتماد سعر العائلة"
                  value={customSubscription}
                  onChange={(e) => setCustomSubscription(e.target.value)}
                />
                <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  إذا كان للطالب كفالة أو خصم خاص استثنائي.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                  تاريخ الانضمام للكُتّاب
                </label>
                <input
                  type="date"
                  required
                  className="input-control"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                />
              </div>
            </div>

            {/* Status & Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                حالة الطالب
              </label>
              <select
                className="input-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">نشط ومستمر في الحفظ</option>
                <option value="inactive">غير نشط (منقطع / مؤجل)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, marginBottom: '6px' }}>
                ملاحظات ومستوى الحفظ
              </label>
              <textarea
                className="input-control"
                rows={3}
                placeholder="مثال: يحفظ سورة البقرة، يحتاج متابعة في مخارج الحروف..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <Check size={18} />
                <span>حفظ بيانات الطالب</span>
              </button>
              <Link
                href="/students"
                className="btn btn-secondary"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewStudentPage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="إضافة طالب جديد" subtitle="جاري تحميل النموذج...">
          <div className="card" style={{ maxWidth: '720px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--text-muted)' }}>جاري تحميل البيانات...</p>
          </div>
        </AppLayout>
      }
    >
      <NewStudentForm />
    </Suspense>
  );
}
