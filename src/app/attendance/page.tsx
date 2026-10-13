'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { AttendanceStatus } from '@/types';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Check,
} from 'lucide-react';

export default function AttendancePage() {
  const {
    students,
    families,
    quickSetStatus,
    markAllForDate,
    getAttendanceForDate,
  } = useKsystem();

  const [date, setDate] = useState<string>('2026-10-08'); // default demo date
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'unrecorded'>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active students only
  const activeStudents = useMemo(() => students.filter((s) => s.status === 'active'), [students]);

  // Attendance map for selected date: studentId -> record
  const dayRecords = useMemo(() => getAttendanceForDate(date), [getAttendanceForDate, date]);
  const statusMap = useMemo(() => {
    const map = new Map<string, { status: AttendanceStatus; notes?: string }>();
    dayRecords.forEach((r) => map.set(r.studentId, { status: r.status, notes: r.notes }));
    return map;
  }, [dayRecords]);

  // Counts for the day
  const presentCount = dayRecords.filter((r) => r.status === 'present').length;
  const absentCount = dayRecords.filter((r) => r.status === 'absent').length;
  const lateCount = dayRecords.filter((r) => r.status === 'late').length;
  const recordedCount = dayRecords.length;
  const rate = recordedCount > 0 ? Math.round(((presentCount + lateCount) / recordedCount) * 100) : 0;

  // Filtered students
  const filteredStudents = useMemo(() => {
    return activeStudents.filter((s) => {
      const matchSearch =
        s.fullName.includes(searchQuery) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      const rec = statusMap.get(s.id);
      if (statusFilter === 'present' && rec?.status !== 'present') return false;
      if (statusFilter === 'absent' && rec?.status !== 'absent') return false;
      if (statusFilter === 'unrecorded' && rec !== undefined) return false;

      return true;
    });
  }, [activeStudents, searchQuery, statusFilter, statusMap]);

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    quickSetStatus(date, studentId, newStatus);
    setSaveSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    markAllForDate(date, status);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AppLayout
      title="كشف الحضور والغياب اليومي"
      subtitle={`تسجيل سريع ومتابعة غياب وحضور طلاب الكُتّاب ليوم ${date}`}
    >
      {/* Date & Global Actions Banner */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--slate-50)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} style={{ color: 'var(--primary-700)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>تاريخ كشف اليوم:</span>
          <input
            type="date"
            className="input-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Quick Bulk Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleMarkAll('present')}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', minHeight: '34px' }}
          >
            <CheckCircle2 size={15} />
            <span>تحديد الكل حاضر ✓</span>
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', minHeight: '34px', color: '#dc2626' }}
          >
            <XCircle size={15} />
            <span>تحديد الكل غائب ✗</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
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

        <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-present-text)' }}>
            {presentCount}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>حاضر اليوم</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-absent-text)' }}>
            {absentCount}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>غائب اليوم</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--status-late-text)' }}>
            {lateCount}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>متأخر</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-700)' }}>
            {rate}%
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>نسبة الحضور</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <style jsx>{`
            @media (min-width: 600px) {
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
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-control"
              placeholder="ابحث باسم الطالب للوصول السريع..."
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
            <option value="all">كل الطلاب النشطين ({activeStudents.length})</option>
            <option value="present">الحاضرون فقط ({presentCount})</option>
            <option value="absent">الغائبون فقط ({absentCount})</option>
            <option value="unrecorded">غير المسجلين بعد ({Math.max(0, activeStudents.length - recordedCount)})</option>
          </select>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            backgroundColor: 'var(--status-present-bg)',
            color: 'var(--status-present-text)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <Check size={16} />
          <span>تم حفظ كشف الحضور بنجاح!</span>
        </div>
      )}

      {/* Roll Call Students List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredStudents.map((student, idx) => {
            const family = student.familyId ? families.find((f) => f.id === student.familyId) : undefined;
            const currentStatus = statusMap.get(student.id)?.status;
            const isP = currentStatus === 'present';
            const isA = currentStatus === 'absent';
            const isL = currentStatus === 'late';

            return (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: idx === filteredStudents.length - 1 ? 'none' : '1px solid var(--border-card)',
                  backgroundColor: isA ? 'rgba(239, 68, 68, 0.04)' : idx % 2 === 0 ? 'transparent' : 'var(--slate-50)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {/* Student Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.925rem' }}>{student.fullName}</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--slate-200)', padding: '1px 6px', borderRadius: '4px' }}>
                      {student.studentCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {family ? family.familyName : 'طالب مستقل'}
                  </div>
                </div>

                {/* Instant Tap Status Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isP ? '2px solid var(--primary-700)' : '1px solid var(--border-card)',
                      backgroundColor: isP ? 'var(--primary-700)' : 'var(--bg-card)',
                      color: isP ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>حاضر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isA ? '2px solid #dc2626' : '1px solid var(--border-card)',
                      backgroundColor: isA ? '#dc2626' : 'var(--bg-card)',
                      color: isA ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <XCircle size={15} />
                    <span>غائب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: isL ? '2px solid #d97706' : '1px solid var(--border-card)',
                      backgroundColor: isL ? '#d97706' : 'var(--bg-card)',
                      color: isL ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Clock size={14} />
                    <span>تأخر</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
