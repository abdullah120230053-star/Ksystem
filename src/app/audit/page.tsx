'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import { Search } from 'lucide-react';

export default function AuditPage() {
  const { auditLogs } = useKsystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const match =
        log.details.includes(searchQuery) ||
        log.userName.includes(searchQuery) ||
        log.action.includes(searchQuery);

      if (!match) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;

      return true;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'payment':
        return { label: 'تسجيل دفع', bg: 'var(--status-paid-bg)', text: 'var(--status-paid-text)' };
      case 'attendance':
        return { label: 'كشف حضور', bg: 'var(--status-present-bg)', text: 'var(--status-present-text)' };
      case 'create':
        return { label: 'إضافة جديد', bg: 'rgba(59, 130, 246, 0.15)', text: '#1d4ed8' };
      case 'update':
        return { label: 'تعديل بيانات', bg: 'var(--status-partial-bg)', text: 'var(--status-partial-text)' };
      case 'delete':
        return { label: 'حذف', bg: 'var(--status-unpaid-bg)', text: 'var(--status-unpaid-text)' };
      case 'void':
        return { label: 'إلغاء معاملة', bg: 'var(--status-unpaid-bg)', text: 'var(--status-unpaid-text)' };
      default:
        return { label: 'إعدادات', bg: 'var(--slate-200)', text: 'var(--slate-800)' };
    }
  };

  return (
    <AppLayout
      title="سجل العمليات والتدقيق (Audit Log)"
      subtitle="تتبع كامل ومؤرخ لكل حركات الدفع والغياب والتعديلات في النظام"
    >
      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: '20px' }}>
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
              placeholder="ابحث في تفاصيل العمليات أو اسم المسؤول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '38px' }}
            />
          </div>

          <select
            className="input-control"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">كل أنواع العمليات ({auditLogs.length})</option>
            <option value="payment">عمليات الدفع والتحصيل</option>
            <option value="attendance">كشوف الحضور والغياب</option>
            <option value="create">عمليات الإضافة</option>
            <option value="update">عمليات التعديل</option>
            <option value="delete">عمليات الحذف</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>سجل التدقيق الزمني</h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
            لا توجد سجلات مطابقة.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map((log, idx) => {
              const badge = getActionBadge(log.action);
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: idx === filteredLogs.length - 1 ? 'none' : '1px solid var(--border-card)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          fontSize: '0.72rem',
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        بواسطة: {log.userName}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                      {log.details}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>
                    {new Date(log.createdAt).toLocaleString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
