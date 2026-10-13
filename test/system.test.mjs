import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// 1. Replicating pure pricing logic for standalone Node testing
function calculateFamilySubscription(familyId, activeStudents, pricingPlans, month, year, override) {
  const siblingCount = activeStudents.length;

  if (siblingCount === 0) {
    return {
      familyId,
      siblingCount: 0,
      normalTotal: 0,
      discountedTotal: 0,
      discountAmount: 0,
      finalAmount: 0,
      isOverrideApplied: false,
    };
  }

  const customStudents = activeStudents.filter((s) => s.customSubscription !== null && s.customSubscription !== undefined);
  const regularStudents = activeStudents.filter((s) => s.customSubscription === null || s.customSubscription === undefined);

  const baseRate = pricingPlans.find((p) => p.siblingCount === 1)?.normalPricePerStudent || 120;
  const customNormalTotal = customStudents.reduce((sum, s) => sum + (s.customSubscription || baseRate), 0);
  const customFinalTotal = customStudents.reduce((sum, s) => sum + (s.customSubscription || 0), 0);

  let regularNormalTotal = 0;
  let regularFinalTotal = 0;

  if (regularStudents.length > 0) {
    const regCount = regularStudents.length;
    const appliedPlan = pricingPlans.find((p) => p.isActive && p.siblingCount === regCount);
    if (appliedPlan) {
      regularNormalTotal = appliedPlan.totalNormalPrice;
      regularFinalTotal = appliedPlan.discountedTotalPrice;
    } else {
      regularNormalTotal = regCount * baseRate;
      regularFinalTotal = regularNormalTotal;
    }
  }

  if (override && override.customTotalPrice >= 0) {
    const normalTotal = customNormalTotal + regularNormalTotal;
    const finalAmount = override.customTotalPrice;
    const discountAmount = Math.max(0, normalTotal - finalAmount);
    return {
      familyId,
      siblingCount,
      normalTotal,
      discountedTotal: finalAmount,
      discountAmount,
      finalAmount,
      isOverrideApplied: true,
    };
  }

  const normalTotal = customNormalTotal + regularNormalTotal;
  const finalAmount = customFinalTotal + regularFinalTotal;
  const discountAmount = Math.max(0, normalTotal - finalAmount);

  return {
    familyId,
    siblingCount,
    normalTotal,
    discountedTotal: finalAmount,
    discountAmount,
    finalAmount,
    isOverrideApplied: false,
  };
}

const DEFAULT_PRICING_PLANS = [
  { id: 'p1', siblingCount: 1, normalPricePerStudent: 120, totalNormalPrice: 120, discountedTotalPrice: 120, discountAmount: 0, isActive: true },
  { id: 'p2', siblingCount: 2, normalPricePerStudent: 120, totalNormalPrice: 240, discountedTotalPrice: 220, discountAmount: 20, isActive: true },
  { id: 'p3', siblingCount: 3, normalPricePerStudent: 120, totalNormalPrice: 360, discountedTotalPrice: 300, discountAmount: 60, isActive: true },
  { id: 'p4', siblingCount: 4, normalPricePerStudent: 120, totalNormalPrice: 480, discountedTotalPrice: 360, discountAmount: 120, isActive: true },
  { id: 'p5', siblingCount: 5, normalPricePerStudent: 120, totalNormalPrice: 600, discountedTotalPrice: 400, discountAmount: 200, isActive: true },
];

const ROLE_PERMISSIONS = {
  admin: [
    'MANAGE_PRICING', 'RECORD_PAYMENT', 'VOID_PAYMENT', 'CREATE_STUDENT',
    'EDIT_STUDENT', 'DELETE_STUDENT', 'CREATE_FAMILY', 'DELETE_FAMILY',
    'RECORD_ATTENDANCE', 'VIEW_FINANCIAL_REPORTS', 'VIEW_ATTENDANCE_REPORTS',
    'MANAGE_SETTINGS', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS'
  ],
  teacher: [
    'RECORD_ATTENDANCE', 'VIEW_ATTENDANCE_REPORTS', 'CREATE_STUDENT', 'EDIT_STUDENT'
  ],
  viewer: [
    'VIEW_ATTENDANCE_REPORTS'
  ],
};

function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

describe('1. Quran School Sibling Pricing Engine', () => {
  it('Single student pays base price: 120 EGP (0 discount)', () => {
    const students = [{ id: 's1', fullName: 'أحمد', customSubscription: null }];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.normalTotal, 120);
    assert.equal(res.discountAmount, 0);
    assert.equal(res.finalAmount, 120);
  });

  it('2 Siblings receive sibling discount: 220 EGP instead of 240 (20 EGP discount)', () => {
    const students = [
      { id: 's1', fullName: 'حمزة', customSubscription: null },
      { id: 's2', fullName: 'إبراهيم', customSubscription: null },
    ];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.normalTotal, 240);
    assert.equal(res.discountAmount, 20);
    assert.equal(res.finalAmount, 220);
  });

  it('3 Siblings receive sibling discount: 300 EGP instead of 360 (60 EGP discount)', () => {
    const students = [
      { id: 's1', fullName: 'أحمد', customSubscription: null },
      { id: 's2', fullName: 'محمود', customSubscription: null },
      { id: 's3', fullName: 'يوسف', customSubscription: null },
    ];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.normalTotal, 360);
    assert.equal(res.discountAmount, 60);
    assert.equal(res.finalAmount, 300);
  });

  it('4 Siblings receive sibling discount: 360 EGP instead of 480 (120 EGP discount)', () => {
    const students = [
      { id: 's1', fullName: 'عبد الرحمن', customSubscription: null },
      { id: 's2', fullName: 'عبد الله', customSubscription: null },
      { id: 's3', fullName: 'جنى', customSubscription: null },
      { id: 's4', fullName: 'خديجة', customSubscription: null },
    ];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.normalTotal, 480);
    assert.equal(res.discountAmount, 120);
    assert.equal(res.finalAmount, 360);
  });

  it('5 Siblings receive sibling discount: 400 EGP instead of 600 (200 EGP discount)', () => {
    const students = [
      { id: 's1', fullName: 'طالب 1', customSubscription: null },
      { id: 's2', fullName: 'طالب 2', customSubscription: null },
      { id: 's3', fullName: 'طالب 3', customSubscription: null },
      { id: 's4', fullName: 'طالب 4', customSubscription: null },
      { id: 's5', fullName: 'طالب 5', customSubscription: null },
    ];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.normalTotal, 600);
    assert.equal(res.discountAmount, 200);
    assert.equal(res.finalAmount, 400);
  });

  it('Handles individual student custom subscription override (e.g. 80 EGP scholarship + 2 regular siblings)', () => {
    const students = [
      { id: 's1', fullName: 'أحمد (كفالة)', customSubscription: 80 },
      { id: 's2', fullName: 'محمود', customSubscription: null },
      { id: 's3', fullName: 'يوسف', customSubscription: null },
    ];
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026);
    // 2 regular siblings = 220 EGP, 1 custom = 80 EGP -> total 300 EGP
    assert.equal(res.finalAmount, 300);
  });

  it('Handles family-level override discount for special cases', () => {
    const students = [
      { id: 's1', fullName: 'طالب 1', customSubscription: null },
      { id: 's2', fullName: 'طالب 2', customSubscription: null },
    ];
    const override = { customTotalPrice: 180, reason: 'ظروف خاصة للأسرة' };
    const res = calculateFamilySubscription('f1', students, DEFAULT_PRICING_PLANS, 10, 2026, override);
    assert.equal(res.finalAmount, 180);
    assert.equal(res.isOverrideApplied, true);
    assert.equal(res.discountAmount, 60);
  });

  it('Edge case: Family with 0 active students returns 0', () => {
    const res = calculateFamilySubscription('f1', [], DEFAULT_PRICING_PLANS, 10, 2026);
    assert.equal(res.finalAmount, 0);
    assert.equal(res.siblingCount, 0);
  });
});

describe('2. Payment Status & Accounting Business Rules', () => {
  it('Determines "paid" status when paid equals or exceeds required final amount', () => {
    const finalAmount = 300;
    const paidAmount = 300;
    const status = paidAmount >= finalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    const remaining = Math.max(0, finalAmount - paidAmount);
    assert.equal(status, 'paid');
    assert.equal(remaining, 0);
  });

  it('Determines "partial" status when partial payment is made', () => {
    const finalAmount = 300;
    const paidAmount = 100;
    const status = paidAmount >= finalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    const remaining = Math.max(0, finalAmount - paidAmount);
    assert.equal(status, 'partial');
    assert.equal(remaining, 200);
  });

  it('Determines "unpaid" status when paid amount is 0', () => {
    const finalAmount = 300;
    const paidAmount = 0;
    const status = paidAmount >= finalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    const remaining = Math.max(0, finalAmount - paidAmount);
    assert.equal(status, 'unpaid');
    assert.equal(remaining, 300);
  });
});

describe('3. Security & Role-Based Access Control (RBAC)', () => {
  it('Admin has full rights to pricing, payments, students, and settings', () => {
    assert.equal(hasPermission('admin', 'MANAGE_PRICING'), true);
    assert.equal(hasPermission('admin', 'RECORD_PAYMENT'), true);
    assert.equal(hasPermission('admin', 'VOID_PAYMENT'), true);
    assert.equal(hasPermission('admin', 'DELETE_STUDENT'), true);
    assert.equal(hasPermission('admin', 'MANAGE_USERS'), true);
  });

  it('Teacher has attendance rights but is blocked from financial and pricing changes', () => {
    assert.equal(hasPermission('teacher', 'RECORD_ATTENDANCE'), true);
    assert.equal(hasPermission('teacher', 'VIEW_ATTENDANCE_REPORTS'), true);
    assert.equal(hasPermission('teacher', 'MANAGE_PRICING'), false);
    assert.equal(hasPermission('teacher', 'VOID_PAYMENT'), false);
    assert.equal(hasPermission('teacher', 'MANAGE_SETTINGS'), false);
    assert.equal(hasPermission('teacher', 'MANAGE_USERS'), false);
  });

  it('Viewer has strictly read-only access', () => {
    assert.equal(hasPermission('viewer', 'VIEW_ATTENDANCE_REPORTS'), true);
    assert.equal(hasPermission('viewer', 'RECORD_ATTENDANCE'), false);
    assert.equal(hasPermission('viewer', 'RECORD_PAYMENT'), false);
    assert.equal(hasPermission('viewer', 'MANAGE_PRICING'), false);
  });
});
