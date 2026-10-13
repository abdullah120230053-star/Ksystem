'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  AlertTriangle,
  Search,
  Printer,
  Download,
  CreditCard,
  Phone,
  Filter,
  CheckCircle2,
  Calendar,
  FileText,
} from 'lucide-react';
import OfficialPdfModal from '@/components/common/OfficialPdfModal';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function UnpaidPage() {
  const {
    unpaidItems,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    settings,
    families,
  } = useKsystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const monthName = MONTHS_AR[selectedMonth - 1];

  // Filtered unpaid list
  const filteredUnpaid = useMemo(() => {
    return unpaidItems.filter((item) => {
      const matchSearch =
        item.name.includes(searchQuery) ||
        item.guardianName.includes(searchQuery) ||
        item.phone.includes(searchQuery) ||
        item.studentNames.some((s) => s.includes(searchQuery));

      if (!matchSearch) return false;

      if (familyFilter !== 'all') {
        if (familyFilter === 'individual' && item.type !== 'individual') return false;
        if (familyFilter !== 'individual' && item.familyId !== familyFilter) return false;
      }

      return true;
    });
  }, [unpaidItems, searchQuery, familyFilter]);

  // Aggregate totals
  const totalRemaining = filteredUnpaid.reduce((sum, item) => sum + item.remainingAmount, 0);
  const totalStudentsAffected = filteredUnpaid.reduce((sum, item) => sum + item.studentsCount, 0);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['الاسم/العائلة', 'النوع', 'ولي الأمر', 'رقم الهاتف', 'عدد الطلاب', 'المطلوب', 'المدفوع', 'المتبقي', 'الحالة'];
    const rows = filteredUnpaid.map((item) => [
      `"${item.name}"`,
      item.type === 'family' ? 'عائلة' : 'طالب مستقل',
      `"${item.guardianName}"`,
      `"${item.phone}"`,
      item.studentsCount,
      item.expectedAmount,
      item.paidAmount,
      item.remainingAmount,
      item.status === 'partial' ? 'سداد جزئي' : 'غير مسدد',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_غير_المسددين_${monthName}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="قائمة الطلاب والعائلات غير المسددين"
      subtitle={`كشف المتأخرات لشهر ${monthName} ${selectedYear}`}
      action={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <FileText size={16} />
            <span>مستند رسمي / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Download size={16} />
            <span>تصدير Excel</span>
          </button>
        </div>
      }
    >
      {/* Print-only Header */}
      <div className="print-only" style={{ marginBottom: '24px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{settings.schoolName}</h1>
        <h2 style={{ fontSize: '1.1rem', marginTop: '4px' }}>كشف الاشتراكات غير المسددة — شهر {monthName} {selectedYear}</h2>
        <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* KPI Alert Banner */}
      <div
        className="card no-print"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.04))',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#991b1b' }}>
              المتبقي للتحصيل: {totalRemaining.toLocaleString()} {settings.currencyName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              على {filteredUnpaid.length} عائلة وطالب ({totalStudentsAffected} طالب متأخر)
            </div>
          </div>
        </div>

        {/* Change Month Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="input-control"
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
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

      {/* Search and Filters */}
      <div className="card no-print" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <style jsx>{`
            @media (min-width: 640px) {
              div {
                grid-template-columns: 2fr 1fr !important;
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
                transform: 'translateY(-50)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-control"
              placeholder="ابحث باسم الطالب أو العائلة أو ولي الأمر أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '38px' }}
            />
          </div>

          <select
            className="input-control"
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
          >
            <option value="all">كل الحالات غير المسددة</option>
            <option value="individual">الطلاب المستقلون فقط</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.familyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unpaid Items Table / List */}
      {filteredUnpaid.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--status-paid-text)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-900)' }}>
            ما شاء الله! تم سداد جميع الاشتراكات بالكامل
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            لا توجد أي مستحقات متأخرة لشهر {monthName} {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>الاسم / العائلة</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>الطلاب</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>ولي الأمر والهاتف</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>المطلوب</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>المدفوع</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>المتبقي</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>الحالة</th>
                  <th className="no-print" style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800, textAlign: 'left' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnpaid.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-card)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.925rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {item.type === 'family' ? 'مجموعة عائلية' : 'طالب مستقل'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700 }}>{item.studentsCount} طالب:</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.studentNames.join('، ')}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.825rem' }}>
                      <div>{item.guardianName}</div>
                      {item.phone && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', direction: 'ltr', textAlign: 'right' }}>
                          {item.phone}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.9rem' }}>
                      {item.expectedAmount} {settings.currencyName}
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                      {item.paidAmount} {settings.currencyName}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 900, fontSize: '1rem', color: '#dc2626' }}>
                      {item.remainingAmount} {settings.currencyName}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: item.status === 'partial' ? 'var(--status-partial-bg)' : 'var(--status-unpaid-bg)',
                          color: item.status === 'partial' ? 'var(--status-partial-text)' : 'var(--status-unpaid-text)',
                        }}
                      >
                        {item.status === 'partial' ? 'سداد جزئي' : 'لم يسدد'}
                      </span>
                    </td>

                    <td className="no-print" style={{ padding: '14px 16px', textAlign: 'left' }}>
                      <Link
                        href={
                          item.type === 'family'
                            ? `/payments/record?familyId=${item.familyId}`
                            : `/payments/record?studentId=${item.studentId}`
                        }
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', minHeight: '32px', fontSize: '0.785rem' }}
                      >
                        <CreditCard size={14} />
                        <span>دفع الآن</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official PDF Document Modal */}
      <OfficialPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        filename={`كشف_المتأخرات_${monthName}_${selectedYear}`}
        documentTitle={`كشف الاشتراكات غير المسددة — شهر ${monthName} ${selectedYear}`}
        subtitle={`حصر رسمي بأسماء الطلاب والعائلات المطالبين بسداد اشتراك شهر ${monthName} لعام ${selectedYear}`}
        schoolName={settings.schoolName}
        adminName={settings.adminName}
        metaItems={[
          { label: 'دورة الشهر', value: `${monthName} ${selectedYear}` },
          { label: 'العملة', value: settings.currencyName },
        ]}
        summaryItems={[
          { label: 'إجمالي غير المسددين', value: `${filteredUnpaid.length} عائلة / طالب`, color: '#dc2626' },
          { label: 'عدد الطلاب المتأثرين', value: `${totalStudentsAffected} طالب`, color: '#b45309' },
          { label: 'إجمالي المبالغ المستحقة', value: `${totalRemaining} ${settings.currencyName}`, color: '#dc2626' },
        ]}
        headers={['الاسم / العائلة', 'النوع', 'ولي الأمر', 'رقم الهاتف', 'عدد الطلاب', 'المطلوب', 'المدفوع', 'المتبقي']}
        rows={filteredUnpaid.map((item) => [
          item.name,
          item.type === 'family' ? 'عائلة (إخوة)' : 'طالب مستقل',
          item.guardianName,
          item.phone || 'غير مسجل',
          item.studentsCount,
          `${item.expectedAmount} ${settings.currencyName}`,
          `${item.paidAmount} ${settings.currencyName}`,
          `${item.remainingAmount} ${settings.currencyName}`,
        ])}
        totalRow={['الإجمالي الكلي المستحق', '-', '-', '-', totalStudentsAffected, '-', '-', `${totalRemaining} ${settings.currencyName}`]}
        notes="يرجى من أولياء الأمور الكرام التكرم بسرعة سداد الاشتراكات الشهرية لضمان انتظام حلقات التحفيظ ونفقات المعلمين."
      />
    </AppLayout>
  );
}
