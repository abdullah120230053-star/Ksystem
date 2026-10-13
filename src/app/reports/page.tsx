'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  Printer,
  Calendar,
  Coins,
  XCircle,
  Users,
  Clock,
} from 'lucide-react';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function ReportsPage() {
  const {
    students,
    families,
    payments,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    dashboardStats,
    unpaidItems,
    settings,
    getStudentAttendanceStats,
  } = useKsystem();

  const [activeTab, setActiveTab] = useState<'financial' | 'attendance' | 'unpaid' | 'students'>('financial');

  const monthName = MONTHS_AR[selectedMonth - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout
      title="التقارير والإحصائيات الشاملة"
      subtitle="استخراج تقارير مالية، وتقارير الغياب والحضور، وقوائم الكُتّاب بصيغة PDF"
      action={
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Printer size={16} />
          <span>طباعة التقرير / PDF</span>
        </button>
      }
    >
      {/* Print-Only Official Header */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '14px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{settings.schoolName}</h1>
        <h2 style={{ fontSize: '1.15rem', marginTop: '4px' }}>
          {activeTab === 'financial' && `التقرير المالي العام — شهر ${monthName} ${selectedYear}`}
          {activeTab === 'attendance' && `تقرير الحضور والغياب العام — شهر ${monthName} ${selectedYear}`}
          {activeTab === 'unpaid' && `كشف المتأخرات وغير المسددين — شهر ${monthName} ${selectedYear}`}
          {activeTab === 'students' && `سجل بيانات طلاب الكُتّاب — عام ${selectedYear}`}
        </h2>
        <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
          تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')} • المشرف: {settings.adminName}
        </div>
      </div>

      {/* Tabs & Month Selector */}
      <div
        className="card no-print"
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Report Type Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'financial', label: 'التقرير المالي', icon: Coins },
            { id: 'attendance', label: 'تقرير الحضور والغياب', icon: Clock },
            { id: 'unpaid', label: 'غير المسددين', icon: XCircle },
            { id: 'students', label: 'قائمة كل الطلاب', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.825rem', padding: '8px 14px', minHeight: '36px' }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--primary-700)' }} />
          <select
            className="input-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.825rem' }}
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

      {/* TAB 1: Financial Report */}
      {activeTab === 'financial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Box */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--border-card)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, marginBottom: '14px', color: 'var(--primary-900)' }}>
              ملخص المركز المالي — شهر {monthName} {selectedYear}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <style jsx>{`
                @media (min-width: 640px) {
                  div {
                    grid-template-columns: repeat(4, 1fr) !important;
                  }
                }
              `}</style>

              <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي الطلاب المسجلين</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {dashboardStats.totalStudents} طالب
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الإيرادات المتوقعة</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {dashboardStats.totalExpectedRevenue.toLocaleString()} {settings.currencyName}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--status-paid-bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-paid-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--status-paid-text)' }}>المحصل الفعلي</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--status-paid-text)' }}>
                  {dashboardStats.totalCollectedRevenue.toLocaleString()} {settings.currencyName}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--status-unpaid-bg)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-unpaid-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--status-unpaid-text)' }}>المتبقي للتحصيل</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--status-unpaid-text)' }}>
                  {dashboardStats.totalRemainingRevenue.toLocaleString()} {settings.currencyName}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              * إجمالي خصومات وعروض الإخوة الممنوحة هذا الشهر:{' '}
              <strong style={{ color: 'var(--accent-700)' }}>
                {dashboardStats.totalDiscountsGiven.toLocaleString()} {settings.currencyName}
              </strong>
            </div>
          </div>

          {/* Families Payment Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-card)' }}>
              <h4 style={{ fontWeight: 800 }}>كشف الاشتراكات التفصيلي حسب العائلات والطلاب</h4>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>العائلة / الطالب</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>عدد الطلاب</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>السعر الأساسي</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الخصم الممنوح</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المطلوب بعد الخصم</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المحصل</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المتبقي</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((fam, idx) => {
                    const famStudents = students.filter((s) => s.familyId === fam.id && s.status === 'active');
                    const payment = payments.find(
                      (p) => p.familyId === fam.id && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear
                    );

                    const paid = payment?.paidAmount || 0;
                    const finalExpected = payment?.finalAmount || 0;
                    const remaining = Math.max(0, finalExpected - paid);
                    const isFullyPaid = payment?.paymentStatus === 'paid';

                    return (
                      <tr key={fam.id} style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '0.875rem' }}>{fam.familyName}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>{famStudents.length} طلاب</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>{payment?.expectedAmount || '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--accent-700)' }}>{payment?.discountAmount || '0'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '0.875rem' }}>{payment?.finalAmount || '-'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--status-paid-text)' }}>{paid}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: remaining > 0 ? '#dc2626' : 'var(--text-muted)' }}>{remaining}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isFullyPaid ? 'var(--status-paid-bg)' : paid > 0 ? 'var(--status-partial-bg)' : 'var(--status-unpaid-bg)',
                              color: isFullyPaid ? 'var(--status-paid-text)' : paid > 0 ? 'var(--status-partial-text)' : 'var(--status-unpaid-text)',
                            }}
                          >
                            {isFullyPaid ? 'مسدد ✓' : paid > 0 ? 'جزئي' : 'غير مسدد'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance Report */}
      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-card)' }}>
            <h4 style={{ fontWeight: 800 }}>تقرير نسب الحضور والغياب لشهر {monthName} {selectedYear}</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>كود الطالب</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>اسم الطالب</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>العائلة</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>أيام الحضور</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>أيام الغياب</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>أيام التأخير</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>نسبة الالتزام</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>التقييم</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const family = student.familyId ? families.find((f) => f.id === student.familyId) : undefined;
                  const stats = getStudentAttendanceStats(student.id, selectedMonth, selectedYear);

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)' }}>
                      <td style={{ padding: '10px 14px', fontSize: '0.8rem', fontWeight: 700 }}>{student.studentCode}</td>
                      <td style={{ padding: '10px 14px', fontSize: '0.9rem', fontWeight: 800 }}>{student.fullName}</td>
                      <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{family ? family.familyName : 'مستقل'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--status-present-text)' }}>{stats.present}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--status-absent-text)' }}>{stats.absent}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--status-late-text)' }}>{stats.late}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 900, color: 'var(--primary-700)' }}>{stats.rate}%</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: stats.rate >= 80 ? 'var(--status-present-bg)' : stats.rate >= 60 ? 'var(--status-late-bg)' : 'var(--status-absent-bg)',
                            color: stats.rate >= 80 ? 'var(--status-present-text)' : stats.rate >= 60 ? 'var(--status-late-text)' : 'var(--status-absent-text)',
                          }}
                        >
                          {stats.rate >= 80 ? 'ممتاز' : stats.rate >= 60 ? 'جيد' : 'يحتاج متابعة'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Unpaid */}
      {activeTab === 'unpaid' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-card)' }}>
            <h4 style={{ fontWeight: 800 }}>كشف الطلاب والعائلات غير المسددين لشهر {monthName}</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الاسم / العائلة</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>ولي الأمر</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>رقم الهاتف</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المطلوب</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المدفوع</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>المتبقي</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {unpaidItems.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800 }}>{item.name}</td>
                    <td style={{ padding: '12px 14px' }}>{item.guardianName}</td>
                    <td style={{ padding: '12px 14px', direction: 'ltr', textAlign: 'right' }}>{item.phone}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{item.expectedAmount} {settings.currencyName}</td>
                    <td style={{ padding: '12px 14px' }}>{item.paidAmount} {settings.currencyName}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 900, color: '#dc2626' }}>{item.remainingAmount} {settings.currencyName}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-unpaid">
                        {item.status === 'partial' ? 'سداد جزئي' : 'لم يسدد'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Students List */}
      {activeTab === 'students' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-card)' }}>
            <h4 style={{ fontWeight: 800 }}>سجل الطلاب الكامل بالكُتّاب ({students.length} طالب)</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الكود</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>اسم الطالب</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>العائلة</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>ولي الأمر</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الهاتف</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>تاريخ الانضمام</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.8rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const family = student.familyId ? families.find((f) => f.id === student.familyId) : undefined;
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{student.studentCode}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{student.fullName}</td>
                      <td style={{ padding: '10px 14px' }}>{family ? family.familyName : 'طالب مستقل'}</td>
                      <td style={{ padding: '10px 14px' }}>{student.guardianName || family?.guardianName || '-'}</td>
                      <td style={{ padding: '10px 14px', direction: 'ltr', textAlign: 'right' }}>{student.phone || family?.phone || '-'}</td>
                      <td style={{ padding: '10px 14px' }}>{student.joinDate}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: student.status === 'active' ? 'var(--status-present-bg)' : 'var(--slate-200)',
                            color: student.status === 'active' ? 'var(--status-present-text)' : 'var(--slate-700)',
                          }}
                        >
                          {student.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
