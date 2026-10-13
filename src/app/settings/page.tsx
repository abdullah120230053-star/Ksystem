'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  Tag,
  BookOpen,
  Calendar,
  Save,
  Check,
  RotateCcw,
  Shield,
  FileText,
  User,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'الأحد' },
  { id: 1, name: 'الإثنين' },
  { id: 2, name: 'الثلاثاء' },
  { id: 3, name: 'الأربعاء' },
  { id: 4, name: 'الخميس' },
  { id: 5, name: 'الجمعة' },
  { id: 6, name: 'السبت' },
];

export default function GeneralSettingsPage() {
  const { settings, updateSettings, resetToSampleData } = useKsystem();

  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencyName, setCurrencyName] = useState(settings.currencyName);
  const [baseSubscription, setBaseSubscription] = useState(settings.baseSubscription);
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminPhone, setAdminPhone] = useState(settings.adminPhone);
  const [pdfHeader, setPdfHeader] = useState(settings.pdfHeader);
  const [studyDays, setStudyDays] = useState<number[]>(settings.studyDays);
  const [saved, setSaved] = useState(false);

  const toggleDay = (dayId: number) => {
    if (studyDays.includes(dayId)) {
      setStudyDays(studyDays.filter((d) => d !== dayId));
    } else {
      setStudyDays([...studyDays, dayId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: schoolName.trim(),
      currency: currency.trim(),
      currencyName: currencyName.trim(),
      baseSubscription: Number(baseSubscription),
      adminName: adminName.trim(),
      adminPhone: adminPhone.trim(),
      pdfHeader: pdfHeader.trim(),
      studyDays,
      studyDaysPerWeek: studyDays.length,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout
      title="إعدادات النظام والكُتّاب"
      subtitle="تهيئة بيانات الكُتّاب، وأيام الدراسة، والعملة، وترويسة التقارير"
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Quick Links: Pricing & Users */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
          <style jsx>{`
            @media (min-width: 600px) {
              div {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>

          <Link
            href="/settings/pricing"
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--primary-50)',
              borderColor: 'var(--primary-300)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-700)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Tag size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: 'var(--primary-900)', fontSize: '0.95rem' }}>
                خطط الأسعار وعروض الإخوة ←
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                تعديل باقات الخصم للأخوين و 3 إخوة وغيرها
              </div>
            </div>
          </Link>

          <Link
            href="/settings/users"
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#eff6ff',
              borderColor: '#bfdbfe',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.95rem' }}>
                المستخدمون والأمان (RBAC) ←
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                إدارة المشرفين، المعلمين، والصلاحيات
              </div>
            </div>
          </Link>
        </div>

        {saved && (
          <div
            style={{
              backgroundColor: 'var(--status-present-bg)',
              color: 'var(--status-present-text)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
            }}
          >
            <Check size={18} />
            <span>تم حفظ الإعدادات بنجاح وتطبيقها على النظام!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* School Identity */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--primary-700)' }} />
              <span>هوية الكُتّاب والبيانات الأساسية</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  اسم الكُتّاب أو المعهد القرآني
                </label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    رمز العملة
                  </label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    اسم العملة بالعربية
                  </label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    value={currencyName}
                    onChange={(e) => setCurrencyName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  الاشتراك الأساسي الافتراضي (للطالب الفردي)
                </label>
                <input
                  type="number"
                  required
                  className="input-control"
                  value={baseSubscription}
                  onChange={(e) => setBaseSubscription(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: 'var(--primary-700)' }} />
              <span>بيانات المشرف والمسؤول</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <style jsx>{`
                @media (min-width: 600px) {
                  div {
                    grid-template-columns: 1fr 1fr !important;
                  }
                }
              `}</style>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  اسم الشيخ / المدير المسؤول
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  رقم الهاتف للإدارة
                </label>
                <input
                  type="tel"
                  className="input-control"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Study Days Configuration */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
              <span>أيام الدراسة الأسبوعية للكُتّاب</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              حدد الأيام التي تُقام فيها الحلقات لحساب نسب الغياب والحضور بدقة:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DAYS_OF_WEEK.map((day) => {
                const isActive = studyDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <span>{day.name}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PDF Reports Header */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--primary-700)' }} />
              <span>ترويسة ملفات PDF والطباعة</span>
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                النص الترويسي للتقارير الرسمية
              </label>
              <input
                type="text"
                className="input-control"
                value={pdfHeader}
                onChange={(e) => setPdfHeader(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
            >
              <Save size={18} />
              <span>حفظ كل الإعدادات</span>
            </button>
          </div>
        </form>

        {/* Danger zone / Reset sample data */}
        <div className="card" style={{ marginTop: '30px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <h4 style={{ color: '#dc2626', fontWeight: 800, marginBottom: '6px' }}>
            منطقة التحكم وإعادة التعيين
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            استعادة بيانات الكُتّاب النموذجية التوضيحية (الطلاب والعائلات والاشتراكات المسجلة مسبقاً).
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm('هل أنت متأكد من استعادة بيانات العينة الأصلية؟')) {
                resetToSampleData();
                alert('تمت استعادة البيانات النموذجية بنجاح!');
              }
            }}
            className="btn btn-secondary"
            style={{ color: '#dc2626', fontSize: '0.825rem' }}
          >
            <RotateCcw size={15} />
            <span>استعادة البيانات النموذجية الأولية</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
