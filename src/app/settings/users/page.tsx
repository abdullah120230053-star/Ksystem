'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Shield,
  UserPlus,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export default function UsersSettingsPage() {
  const { users, currentUser, addUser, deleteUser, switchUser } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('يرجى ملء الاسم والبريد الإلكتروني');
      return;
    }
    addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      isActive: true,
    });
    setName('');
    setEmail('');
    setIsAdding(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return { label: 'مدير نظام كامل (Super Admin)', bg: '#dcfce7', text: '#15803d' };
      case 'teacher':
        return { label: 'معلم حلقة (Teacher)', bg: '#dbeafe', text: '#1d4ed8' };
      case 'viewer':
        return { label: 'مراقب / ولي أمر (Viewer)', bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  return (
    <AppLayout
      title="إدارة المستخدمين والأمان والصلاحيات"
      subtitle="تحديد أدوار المشرفين والمعلمين وتعيين صلاحيات النظام (RBAC)"
    >
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Link
            href="/settings"
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
            <span>العودة للإعدادات</span>
          </Link>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>

        {/* Roles & Permissions Explanation Card */}
        <div className="card" style={{ marginBottom: '20px', backgroundColor: 'var(--slate-50)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: 'var(--primary-700)' }} />
            <span>مستويات الأمان والصلاحيات في النظام (Roles Matrix)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.825rem' }}>
            <style jsx>{`
              @media (min-width: 600px) {
                div {
                  grid-template-columns: repeat(3, 1fr) !important;
                }
              }
            `}</style>

            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>المدير (Admin)</div>
              <ul style={{ paddingRight: '16px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <li>كامل الصلاحيات</li>
                <li>تعديل الأسعار والخصومات</li>
                <li>تسجيل وإلغاء المدفوعات</li>
                <li>حذف وتعديل الطلاب</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 800, color: '#1d4ed8', marginBottom: '4px' }}>المعلم (Teacher)</div>
              <ul style={{ paddingRight: '16px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <li>تسجيل الحضور والغياب اليومي</li>
                <li>استعراض بيانات الطلاب والحلقات</li>
                <li>الاطلاع على تقارير الغياب</li>
                <li>لا يستطيع تغيير الأسعار أو المالية</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 800, color: '#4b5563', marginBottom: '4px' }}>المراقب (Viewer)</div>
              <ul style={{ paddingRight: '16px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <li>صلاحية قراءة فقط (Read-only)</li>
                <li>مشاهدة كشوفات الحضور</li>
                <li>لا يمكنه تعديل أي بيانات</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add User Modal / Form */}
        {isAdding && (
          <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary-600)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
              إضافة مستخدم جديد للنظام
            </h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="مثال: الشيخ محمود سالم"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-control"
                    placeholder="user@ksystem.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    الدور والصلاحية *
                  </label>
                  <select
                    className="input-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="admin">مدير (Admin)</option>
                    <option value="teacher">معلم (Teacher)</option>
                    <option value="viewer">مراقب (Viewer)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  حفظ المستخدم
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>حسابات المستخدمين النشطة ({users.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {users.map((u, idx) => {
              const badge = getRoleBadge(u.role);
              const isCurrent = currentUser.id === u.id;

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: idx === users.length - 1 ? 'none' : '1px solid var(--border-card)',
                    backgroundColor: isCurrent ? 'rgba(34, 197, 94, 0.05)' : idx % 2 === 0 ? 'transparent' : 'var(--slate-50)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{u.name}</span>
                      {isCurrent && (
                        <span
                          style={{
                            backgroundColor: 'var(--primary-700)',
                            color: '#fff',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          الحساب الحالي المفعّل
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {u.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.text,
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                      }}
                    >
                      {badge.label}
                    </span>

                    <button
                      onClick={() => switchUser(u.id)}
                      className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', minHeight: '32px', fontSize: '0.785rem' }}
                    >
                      {isCurrent ? 'مفعّل الآن ✓' : 'تبديل لهذا الحساب'}
                    </button>

                    {u.id !== 'user-admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`هل تريد حذف حساب ${u.name}؟`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', minHeight: '32px', fontSize: '0.785rem', color: '#dc2626' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
