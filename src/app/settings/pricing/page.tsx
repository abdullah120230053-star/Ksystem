'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useKsystem } from '@/context/KsystemContext';
import {
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

export default function PricingSettingsPage() {
  const { pricingPlans, updatePricingPlan, addPricingPlan, deletePricingPlan, settings } = useKsystem();

  const [isAdding, setIsAdding] = useState(false);
  const [newSiblingCount, setNewSiblingCount] = useState<number>(pricingPlans.length + 1);
  const [newNormalPrice, setNewNormalPrice] = useState<number>(settings.baseSubscription || 120);
  const [newDiscountedPrice, setNewDiscountedPrice] = useState<number>(450);

  // Edit modal / state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editDiscountedPrice, setEditDiscountedPrice] = useState<number>(0);
  const [editNormalPrice, setEditNormalPrice] = useState<number>(0);

  const startEdit = (plan: any) => {
    setEditingPlanId(plan.id);
    setEditDiscountedPrice(plan.discountedTotalPrice);
    setEditNormalPrice(plan.normalPricePerStudent);
  };

  const saveEdit = (planId: string) => {
    updatePricingPlan(planId, {
      discountedTotalPrice: editDiscountedPrice,
      normalPricePerStudent: editNormalPrice,
    });
    setEditingPlanId(null);
  };

  const handleAddNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiblingCount <= 0 || newDiscountedPrice <= 0) {
      alert('يرجى إدخال قيم صحيحة أكبر من صفر');
      return;
    }
    addPricingPlan({
      siblingCount: Number(newSiblingCount),
      normalPricePerStudent: Number(newNormalPrice),
      discountedTotalPrice: Number(newDiscountedPrice),
      isActive: true,
    });
    setIsAdding(false);
  };

  return (
    <AppLayout
      title="خطط الأسعار وعروض الإخوة"
      subtitle="تعديل باقات الاشتراكات وخصومات الإخوة ديناميكياً بدون كود ثابت"
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            <Plus size={16} />
            <span>إضافة شريحة عرض جديدة</span>
          </button>
        </div>


        {/* Add Tier Form */}
        {isAdding && (
          <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary-600)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>
              إضافة شريحة عائلية جديدة
            </h3>
            <form onSubmit={handleAddNewPlan} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <style jsx>{`
                @media (min-width: 600px) {
                  form {
                    grid-template-columns: 1fr 1fr 1fr !important;
                  }
                }
              `}</style>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  عدد الإخوة بالعائلة
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-control"
                  value={newSiblingCount}
                  onChange={(e) => setNewSiblingCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  السعر العادي للطالب
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-control"
                  value={newNormalPrice}
                  onChange={(e) => setNewNormalPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  سعر العرض الإجمالي المخفض
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-control"
                  value={newDiscountedPrice}
                  onChange={(e) => setNewDiscountedPrice(Number(e.target.value))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  حفظ الشريحة الجديدة
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

        {/* Pricing Plans Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>جدول العروض والشرائح المعتمدة</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>عدد الإخوة</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>السعر الأساسي لكل طالب</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>الإجمالي العادي</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>سعر العرض المخفض</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800 }}>قيمة الخصم الممنوح</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.825rem', fontWeight: 800, textAlign: 'left' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pricingPlans.map((plan, idx) => {
                  const isEditingThis = editingPlanId === plan.id;

                  return (
                    <tr
                      key={plan.id}
                      style={{
                        borderBottom: '1px solid var(--border-card)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--slate-50)',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 900, fontSize: '0.95rem' }}>
                        {plan.siblingCount === 1 ? 'طالب واحد' : `${plan.siblingCount} إخوة`}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {isEditingThis ? (
                          <input
                            type="number"
                            className="input-control"
                            style={{ width: '90px', padding: '4px 8px' }}
                            value={editNormalPrice}
                            onChange={(e) => setEditNormalPrice(Number(e.target.value))}
                          />
                        ) : (
                          `${plan.normalPricePerStudent} ${settings.currencyName}`
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--slate-600)' }}>
                        {plan.totalNormalPrice} {settings.currencyName}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {isEditingThis ? (
                          <input
                            type="number"
                            className="input-control"
                            style={{ width: '90px', padding: '4px 8px', fontWeight: 800 }}
                            value={editDiscountedPrice}
                            onChange={(e) => setEditDiscountedPrice(Number(e.target.value))}
                          />
                        ) : (
                          <span style={{ fontWeight: 900, color: 'var(--primary-700)', fontSize: '1rem' }}>
                            {plan.discountedTotalPrice} {settings.currencyName}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {plan.discountAmount > 0 ? (
                          <span
                            style={{
                              backgroundColor: 'var(--accent-100)',
                              color: 'var(--accent-800)',
                              fontWeight: 800,
                              fontSize: '0.785rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            وفر {plan.discountAmount} {settings.currencyName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>بدون خصم</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        {isEditingThis ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => saveEdit(plan.id)}
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', minHeight: '30px', fontSize: '0.75rem' }}
                            >
                              <Check size={14} />
                              <span>حفظ</span>
                            </button>
                            <button
                              onClick={() => setEditingPlanId(null)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', minHeight: '30px', fontSize: '0.75rem' }}
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => startEdit(plan)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', minHeight: '30px', fontSize: '0.75rem' }}
                            >
                              <Edit2 size={13} />
                              <span>تعديل</span>
                            </button>
                            {pricingPlans.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm('هل تريد حذف هذه الشريحة؟')) {
                                    deletePricingPlan(plan.id);
                                  }
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', minHeight: '30px', fontSize: '0.75rem', color: '#dc2626' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
