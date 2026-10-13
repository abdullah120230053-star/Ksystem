'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useKsystem } from '@/context/KsystemContext';
import { BookOpen, Lock, Mail, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, users, switchUser } = useAuth();
  const { settings } = useKsystem();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (success) {
      router.push('/');
    } else {
      setError('البريد الإلكتروني غير مسجل أو الحساب غير مفعل.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-card)',
        }}
      >
        {/* Brand Logo & Name */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 6px 16px rgba(21, 128, 61, 0.3)',
            }}
          >
            <BookOpen size={28} />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-900)' }}>
            {settings.schoolName}
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            تسجيل الدخول إلى لوحة إدارة الكُتّاب والاشتراكات
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--status-unpaid-bg)',
              color: 'var(--status-unpaid-text)',
              border: '1px solid var(--status-unpaid-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
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
                type="email"
                required
                className="input-control"
                style={{ paddingRight: '38px' }}
                placeholder="admin@ksystem.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
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
                type="password"
                className="input-control"
                style={{ paddingRight: '38px' }}
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.95rem', padding: '12px', marginTop: '6px' }}
          >
            <span>تسجيل الدخول</span>
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px', fontWeight: 700 }}>
            ⚡ تجربة سريعة بدون كتابة بيانات:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('user-admin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: '#15803d' }} />
                <span>الشيخ أحمد الفضل</span>
              </div>
              <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.7rem' }}>
                مدير (Admin)
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('user-teacher-1')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: '#2563eb' }} />
                <span>الشيخ محمود سالم</span>
              </div>
              <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.7rem' }}>
                معلم (Teacher)
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('user-viewer-1')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: '#6b7280' }} />
                <span>ولي أمر / مراقب</span>
              </div>
              <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '0.7rem' }}>
                مراقب (Viewer)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
