'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  ArrowRight,
  UserCheck,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  CreditCard,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const router = useRouter();

  const {
    getStudent,
    getFamily,
    getStudentAttendanceStats,
    attendance,
    payments,
    selectedMonth,
    selectedYear,
    settings,
    updateStudent,
    deleteStudent,
  } = useKsystem();

  const student = getStudent(studentId);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(student?.notes || '');
  const [editStatus, setEditStatus] = useState(student?.status || 'active');

  if (!student) {
    return (
      <AppLayout title="الملف غير موجود">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h2>عذراً، لم يتم العثور على هذا الطالب!</h2>
          <Link href="/students" className="btn btn-primary" style={{ marginTop: '16px' }}>
            العودة لسجل الطلاب
          </Link>
        </div>
      </AppLayout>
    );
  }

  const family = student.familyId ? getFamily(student.familyId) : undefined;
  const attendanceStats = getStudentAttendanceStats(student.id, selectedMonth, selectedYear);

  // Student specific attendance log
  const studentAttendanceLog = attendance
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
    .slice(0, 10);

  // Payment status for this month
  const familyPayment = student.familyId
    ? payments.find((p) => p.familyId === student.familyId && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear)
    : payments.find((p) => p.familyId === `indiv-${student.id}` && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);

  const isPaid = familyPayment?.paymentStatus === 'paid' || familyPayment?.paymentStatus === 'overpaid';
  const isPartial = familyPayment?.paymentStatus === 'partial';

  const handleSaveEdit = () => {
    updateStudent(student.id, {
      notes: editNotes,
      status: editStatus,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف الطالب "${student.fullName}"؟ سيتم الاحتفاظ بالسجلات السابقة.`)) {
      deleteStudent(student.id);
      router.push('/students');
    }
  };

  return (
    <AppLayout
      title={student.fullName}
      subtitle={`كود الطالب: ${student.studentCode} • تاريخ الانضمام: ${student.joinDate}`}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }}
            >
              <Edit2 size={14} />
              <span>{isEditing ? 'إلغاء التعديل' : 'تعديل الحالة'}</span>
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem', color: '#dc2626' }}
            >
              <Trash2 size={14} />
              <span>حذف</span>
            </button>
          </div>
        </div>

        {/* Edit Box if active */}
        {isEditing && (
          <div className="card" style={{ marginBottom: '16px', border: '2px solid var(--primary-600)' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '12px' }}>تعديل الحالة والملاحظات</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  حالة الطالب
                </label>
                <select
                  className="input-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">نشط ومستمر</option>
                  <option value="inactive">غير نشط (منقطع)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  ملاحظات
                </label>
                <textarea
                  className="input-control"
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <button onClick={handleSaveEdit} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Check size={16} />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="card" style={{ marginBottom: '16px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-900)',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.785rem',
                  }}
                >
                  {student.studentCode}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: student.status === 'active' ? 'var(--status-present-bg)' : 'var(--slate-200)',
                    color: student.status === 'active' ? 'var(--status-present-text)' : 'var(--slate-700)',
                  }}
                >
                  {student.status === 'active' ? 'طالب نشط' : 'غير نشط'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {student.fullName}
              </h2>

              {family ? (
                <Link
                  href={`/families/${family.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--primary-800)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    marginTop: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <UserCheck size={16} />
                  <span>ينتمي إلى: {family.familyName}</span>
                </Link>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  طالب مستقل (بدون عائلة)
                </div>
              )}
            </div>

            {/* Quick Contact & Info */}
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Phone size={14} />
                <span>ولي الأمر: {student.guardianName || family?.guardianName || 'غير مسجل'}</span>
              </div>
              <div style={{ fontWeight: 700, marginTop: '4px' }}>
                الهاتف: {student.phone || family?.phone || 'غير مسجل'}
              </div>
            </div>
          </div>

          {student.notes && (
            <div
              style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-card)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <strong>ملاحظات الحفظ: </strong> {student.notes}
            </div>
          )}
        </div>

        {/* Subscription & Payment Section */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: 'var(--primary-700)' }} />
              <span>اشتراك شهر {selectedMonth} / {selectedYear}</span>
            </h3>

            {isPaid ? (
              <span className="badge badge-paid">
                <CheckCircle2 size={13} />
                <span>تم السداد بالكامل ✓</span>
              </span>
            ) : isPartial ? (
              <span className="badge badge-partial">
                <span>سداد جزئي</span>
              </span>
            ) : (
              <span className="badge badge-unpaid">
                <XCircle size={13} />
                <span>لم يسدد بعد ✗</span>
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--slate-50)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>قيمة الاشتراك المطلوب</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-900)' }}>
                {student.customSubscription
                  ? `${student.customSubscription} ${settings.currencyName} (سعر مخصص)`
                  : family
                  ? `ضمن باقة عائلة ${family.familyName}`
                  : `${settings.baseSubscription} ${settings.currencyName}`}
              </div>
            </div>

            {family ? (
              <Link
                href={`/families/${family.id}`}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <span>تسجيل دفع للعائلة</span>
              </Link>
            ) : (
              <Link
                href={`/payments/record?studentId=${student.id}`}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <span>تسجيل دفع لهذا الطالب</span>
              </Link>
            )}
          </div>
        </div>

        {/* Monthly Attendance Card */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
            <span>حضور وغياب الطالب في شهر {selectedMonth}</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ backgroundColor: 'var(--slate-50)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--status-present-text)' }}>
                {attendanceStats.present}
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>أيام الحضور</div>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--status-absent-text)' }}>
                {attendanceStats.absent}
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>أيام الغياب</div>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--status-late-text)' }}>
                {attendanceStats.late}
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>تأخير</div>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                {attendanceStats.rate}%
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>نسبة الالتزام</div>
            </div>
          </div>

          {/* Recent Attendance Days List */}
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
            سجل آخر الأيام المسجلة:
          </h4>

          {studentAttendanceLog.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
              لم يُسجل حضور أو غياب لهذا الطالب حتى الآن.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {studentAttendanceLog.map((log) => {
                const isP = log.status === 'present';
                const isA = log.status === 'absent';
                const isL = log.status === 'late';

                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--slate-50)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      يوم {log.attendanceDate}
                    </span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isP
                          ? 'var(--status-present-bg)'
                          : isA
                          ? 'var(--status-absent-bg)'
                          : 'var(--status-late-bg)',
                        color: isP
                          ? 'var(--status-present-text)'
                          : isA
                          ? 'var(--status-absent-text)'
                          : 'var(--status-late-text)',
                      }}
                    >
                      {isP ? 'حاضر ✓' : isA ? 'غائب ✗' : isL ? 'متأخر ⏰' : 'معذور'}
                      {log.notes && ` (${log.notes})`}
                    </span>
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
