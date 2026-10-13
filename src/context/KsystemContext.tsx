'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Student,
  Family,
  PricingPlan,
  FamilyPayment,
  PaymentTransaction,
  AttendanceRecord,
  AttendanceStatus,
  FamilyOverride,
  SystemSettings,
  AuditLog,
  PaymentMethod,
} from '@/types';
import {
  INITIAL_FAMILIES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ATTENDANCE,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/seed-data';
import { DEFAULT_PRICING_PLANS, calculateFamilySubscription } from '@/lib/pricing-engine';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  paidStudentsCount: number;
  unpaidStudentsCount: number;
  totalExpectedRevenue: number;
  totalCollectedRevenue: number;
  totalRemainingRevenue: number;
  totalDiscountsGiven: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayLateCount: number;
  attendanceRateToday: number;
}

export interface UnpaidItem {
  id: string; // familyId or studentId
  type: 'family' | 'individual';
  name: string;
  guardianName: string;
  phone: string;
  studentsCount: number;
  studentNames: string[];
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partial';
  familyId?: string;
  studentId?: string;
}

interface KsystemContextType {
  // State
  students: Student[];
  families: Family[];
  pricingPlans: PricingPlan[];
  payments: FamilyPayment[];
  transactions: PaymentTransaction[];
  attendance: AttendanceRecord[];
  overrides: FamilyOverride[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;

  // Setters
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'studentCode'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudent: (id: string) => Student | undefined;

  // Family Actions
  addFamily: (family: Omit<Family, 'id' | 'createdAt'>) => Family;
  updateFamily: (id: string, updates: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  getFamily: (id: string) => Family | undefined;
  getFamilyStudents: (familyId: string) => Student[];

  // Payment Actions
  recordPayment: (params: {
    familyId: string;
    month: number;
    year: number;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  recordIndividualPayment: (params: {
    studentId: string;
    month: number;
    year: number;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  voidPayment: (paymentId: string, reason: string) => void;
  getFamilyPayment: (familyId: string, month: number, year: number) => FamilyPayment | undefined;

  // Attendance Actions
  recordDailyAttendance: (date: string, records: { studentId: string; status: AttendanceStatus; notes?: string }[]) => void;
  quickSetStatus: (date: string, studentId: string, status: AttendanceStatus) => void;
  markAllForDate: (date: string, status: AttendanceStatus) => void;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getStudentAttendanceStats: (studentId: string, month?: number, year?: number) => {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
  };

  // Pricing & Settings Actions
  updatePricingPlan: (id: string, updates: Partial<PricingPlan>) => void;
  addPricingPlan: (plan: Omit<PricingPlan, 'id' | 'totalNormalPrice' | 'discountAmount'>) => void;
  deletePricingPlan: (id: string) => void;
  updateSettings: (updates: Partial<SystemSettings>) => void;

  // Computed & Reports
  dashboardStats: DashboardStats;
  unpaidItems: UnpaidItem[];
  resetToSampleData: () => void;
  isHydrated: boolean;
}

const KsystemContext = createContext<KsystemContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'ksystem_students_v1',
  FAMILIES: 'ksystem_families_v1',
  PRICING: 'ksystem_pricing_v1',
  PAYMENTS: 'ksystem_payments_v1',
  TRANSACTIONS: 'ksystem_transactions_v1',
  ATTENDANCE: 'ksystem_attendance_v1',
  SETTINGS: 'ksystem_settings_v1',
  AUDIT: 'ksystem_audit_v1',
};

export function KsystemProvider({ children }: { children: React.ReactNode }) {
  const isLoading = false;
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [families, setFamilies] = useState<Family[]>(INITIAL_FAMILIES);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [payments, setPayments] = useState<FamilyPayment[]>(INITIAL_PAYMENTS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [overrides] = useState<FamilyOverride[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Synchronize state from localStorage once mounted on client to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        if (s) setStudents(JSON.parse(s));
        const f = localStorage.getItem(STORAGE_KEYS.FAMILIES);
        if (f) setFamilies(JSON.parse(f));
        const p = localStorage.getItem(STORAGE_KEYS.PRICING);
        if (p) setPricingPlans(JSON.parse(p));
        const pay = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        if (pay) setPayments(JSON.parse(pay));
        const tx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (tx) setTransactions(JSON.parse(tx));
        const att = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
        if (att) setAttendance(JSON.parse(att));
        const set = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (set) setSettings(JSON.parse(set));
        const aud = localStorage.getItem(STORAGE_KEYS.AUDIT);
        if (aud) setAuditLogs(JSON.parse(aud));
      }
    } catch (e) {
      console.warn('Failed to load storage on mount', e);
    }
    setIsHydrated(true);
  }, []);

  // Save changes to LocalStorage
  const saveStorage = useCallback((key: string, data: unknown) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Failed to write to localStorage', e);
    }
  }, []);

  const addAuditLog = useCallback((action: AuditLog['action'], entityType: AuditLog['entityType'], details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: 'user-admin',
      userName: settings.adminName || 'مدير النظام',
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveStorage(STORAGE_KEYS.AUDIT, updated);
      return updated;
    });
  }, [saveStorage, settings.adminName]);

  // Student Actions
  const addStudent = useCallback((data: Omit<Student, 'id' | 'createdAt' | 'studentCode'>): Student => {
    const count = students.length + 1;
    const code = `STU-${String(count).padStart(3, '0')}`;
    const newStudent: Student = {
      ...data,
      id: `stu-${Date.now()}`,
      studentCode: code,
      createdAt: new Date().toISOString(),
    };

    setStudents((prev) => {
      const updated = [...prev, newStudent];
      saveStorage(STORAGE_KEYS.STUDENTS, updated);
      return updated;
    });

    addAuditLog('create', 'student', `إضافة الطالب: ${newStudent.fullName} (${code})`, newStudent.id);
    return newStudent;
  }, [students.length, saveStorage, addAuditLog]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveStorage(STORAGE_KEYS.STUDENTS, updated);
      return updated;
    });
    addAuditLog('update', 'student', `تعديل بيانات الطالب المعرف: ${id}`, id);
  }, [saveStorage, addAuditLog]);

  const deleteStudent = useCallback((id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveStorage(STORAGE_KEYS.STUDENTS, updated);
      return updated;
    });
    addAuditLog('delete', 'student', `حذف الطالب: ${target?.fullName || id}`, id);
  }, [students, saveStorage, addAuditLog]);

  const getStudent = useCallback((id: string) => students.find((s) => s.id === id), [students]);

  // Family Actions
  const addFamily = useCallback((data: Omit<Family, 'id' | 'createdAt'>): Family => {
    const newFamily: Family = {
      ...data,
      id: `fam-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setFamilies((prev) => {
      const updated = [...prev, newFamily];
      saveStorage(STORAGE_KEYS.FAMILIES, updated);
      return updated;
    });

    addAuditLog('create', 'family', `إضافة عائلة جديدة: ${newFamily.familyName}`, newFamily.id);
    return newFamily;
  }, [saveStorage, addAuditLog]);

  const updateFamily = useCallback((id: string, updates: Partial<Family>) => {
    setFamilies((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      saveStorage(STORAGE_KEYS.FAMILIES, updated);
      return updated;
    });
    addAuditLog('update', 'family', `تعديل بيانات العائلة المعرفة: ${id}`, id);
  }, [saveStorage, addAuditLog]);

  const deleteFamily = useCallback((id: string) => {
    const target = families.find((f) => f.id === id);
    setFamilies((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveStorage(STORAGE_KEYS.FAMILIES, updated);
      return updated;
    });
    // Unlink students
    setStudents((prev) => {
      const updated = prev.map((s) => (s.familyId === id ? { ...s, familyId: null } : s));
      saveStorage(STORAGE_KEYS.STUDENTS, updated);
      return updated;
    });
    addAuditLog('delete', 'family', `حذف العائلة: ${target?.familyName || id}`, id);
  }, [families, saveStorage, addAuditLog]);

  const getFamily = useCallback((id: string) => families.find((f) => f.id === id), [families]);
  const getFamilyStudents = useCallback((familyId: string) => students.filter((s) => s.familyId === familyId), [students]);

  // Payment Actions
  const getFamilyPayment = useCallback((familyId: string, month: number, year: number) => {
    return payments.find((p) => p.familyId === familyId && p.paymentMonth === month && p.paymentYear === year);
  }, [payments]);

  const recordPayment = useCallback(({
    familyId,
    month,
    year,
    amount,
    paymentMethod,
    notes,
  }: {
    familyId: string;
    month: number;
    year: number;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const fam = families.find((f) => f.id === familyId);
    if (!fam) return;

    const famStudents = students.filter((s) => s.familyId === familyId && s.status === 'active');
    const override = overrides.find((o) => o.familyId === familyId && o.paymentMonth === month && o.paymentYear === year);
    const calc = calculateFamilySubscription(familyId, famStudents, pricingPlans, month, year, override);

    const existingPayment = getFamilyPayment(familyId, month, year);
    const currentPaid = existingPayment ? existingPayment.paidAmount : 0;
    const newTotalPaid = currentPaid + amount;
    const finalExpected = calc.finalAmount;

    let status: FamilyPayment['paymentStatus'] = 'unpaid';
    if (newTotalPaid >= finalExpected && finalExpected > 0) {
      status = newTotalPaid > finalExpected ? 'overpaid' : 'paid';
    } else if (newTotalPaid > 0) {
      status = 'partial';
    }

    const paymentId = existingPayment ? existingPayment.id : `pay-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const updatedPayment: FamilyPayment = {
      id: paymentId,
      familyId,
      paymentMonth: month,
      paymentYear: year,
      activeSiblingsCount: calc.siblingCount,
      expectedAmount: calc.normalTotal,
      discountAmount: calc.discountAmount,
      finalAmount: finalExpected,
      paidAmount: newTotalPaid,
      remainingAmount: Math.max(0, finalExpected - newTotalPaid),
      paymentStatus: status,
      pricingPlanId: calc.pricingPlanApplied?.id,
      notes: notes || existingPayment?.notes,
      recordedBy: 'user-admin',
      recordedByName: settings.adminName,
      paymentDate: nowIso,
      createdAt: existingPayment ? existingPayment.createdAt : nowIso,
      updatedAt: nowIso,
    };

    setPayments((prev) => {
      const filtered = prev.filter((p) => p.id !== paymentId);
      const updated = [updatedPayment, ...filtered];
      saveStorage(STORAGE_KEYS.PAYMENTS, updated);
      return updated;
    });

    const newTransaction: PaymentTransaction = {
      id: `trx-${Date.now()}`,
      familyPaymentId: paymentId,
      amount,
      transactionType: 'payment',
      paymentMethod,
      notes,
      recordedBy: 'user-admin',
      recordedByName: settings.adminName,
      transactionDate: nowIso,
    };

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev];
      saveStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });

    addAuditLog(
      'payment',
      'payment',
      `تسجيل دفعة بقيمة ${amount} ${settings.currencyName} لعائلة "${fam.familyName}" لشهر ${month}/${year} (الحالة: ${status === 'paid' ? 'مدفوع بالكامل' : 'دفع جزئي'})`,
      paymentId
    );
  }, [families, students, overrides, pricingPlans, getFamilyPayment, settings.adminName, settings.currencyName, saveStorage, addAuditLog]);

  const recordIndividualPayment = useCallback(({
    studentId,
    month,
    year,
    amount,
    paymentMethod,
    notes,
  }: {
    studentId: string;
    month: number;
    year: number;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.familyId) {
      recordPayment({
        familyId: student.familyId,
        month,
        year,
        amount,
        paymentMethod,
        notes: `عن الطالب ${student.fullName}${notes ? `: ${notes}` : ''}`,
      });
      return;
    }

    const pseudoFamilyId = `indiv-${student.id}`;
    const expected = student.customSubscription || settings.baseSubscription;
    const existing = payments.find((p) => p.familyId === pseudoFamilyId && p.paymentMonth === month && p.paymentYear === year);
    const newPaid = (existing ? existing.paidAmount : 0) + amount;
    const paymentId = existing ? existing.id : `pay-indiv-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const paymentRecord: FamilyPayment = {
      id: paymentId,
      familyId: pseudoFamilyId,
      paymentMonth: month,
      paymentYear: year,
      activeSiblingsCount: 1,
      expectedAmount: expected,
      discountAmount: 0,
      finalAmount: expected,
      paidAmount: newPaid,
      remainingAmount: Math.max(0, expected - newPaid),
      paymentStatus: newPaid >= expected ? 'paid' : 'partial',
      notes,
      recordedBy: 'user-admin',
      recordedByName: settings.adminName,
      paymentDate: nowIso,
      createdAt: existing ? existing.createdAt : nowIso,
      updatedAt: nowIso,
    };

    setPayments((prev) => {
      const filtered = prev.filter((p) => p.id !== paymentId);
      const updated = [paymentRecord, ...filtered];
      saveStorage(STORAGE_KEYS.PAYMENTS, updated);
      return updated;
    });

    const newTrx: PaymentTransaction = {
      id: `trx-${Date.now()}`,
      familyPaymentId: paymentId,
      amount,
      transactionType: 'payment',
      paymentMethod,
      notes: `سداد فردي للطالب ${student.fullName}`,
      recordedBy: 'user-admin',
      recordedByName: settings.adminName,
      transactionDate: nowIso,
    };

    setTransactions((prev) => {
      const updated = [newTrx, ...prev];
      saveStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });

    addAuditLog('payment', 'payment', `تسجيل سداد فردي للطالب ${student.fullName} بمبلغ ${amount} ${settings.currencyName}`, paymentId);
  }, [students, settings.baseSubscription, settings.adminName, settings.currencyName, payments, saveStorage, addAuditLog, recordPayment]);

  const voidPayment = useCallback((paymentId: string, reason: string) => {
    setPayments((prev) => {
      const updated = prev.map((p) => (p.id === paymentId ? { ...p, paymentStatus: 'void' as const, remainingAmount: p.finalAmount, paidAmount: 0 } : p));
      saveStorage(STORAGE_KEYS.PAYMENTS, updated);
      return updated;
    });

    const voidTrx: PaymentTransaction = {
      id: `trx-${Date.now()}`,
      familyPaymentId: paymentId,
      amount: 0,
      transactionType: 'void',
      paymentMethod: 'other',
      notes: `إلغاء المعاملة: ${reason}`,
      recordedBy: 'user-admin',
      recordedByName: settings.adminName,
      transactionDate: new Date().toISOString(),
    };

    setTransactions((prev) => {
      const updated = [voidTrx, ...prev];
      saveStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });

    addAuditLog('void', 'payment', `إلغاء السداد بالمعرف ${paymentId}: ${reason}`, paymentId);
  }, [settings.adminName, saveStorage, addAuditLog]);

  // Attendance Actions
  const recordDailyAttendance = useCallback((date: string, records: { studentId: string; status: AttendanceStatus; notes?: string }[]) => {
    const nowIso = new Date().toISOString();
    setAttendance((prev) => {
      const filtered = prev.filter((r) => r.attendanceDate !== date);
      const newRecords: AttendanceRecord[] = records.map((r) => ({
        id: `att-${Date.now()}-${r.studentId}`,
        studentId: r.studentId,
        attendanceDate: date,
        status: r.status,
        notes: r.notes,
        recordedBy: 'user-admin',
        updatedAt: nowIso,
      }));
      const updated = [...newRecords, ...filtered];
      saveStorage(STORAGE_KEYS.ATTENDANCE, updated);
      return updated;
    });

    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    addAuditLog('attendance', 'attendance', `تسجيل حضور يوم ${date} (حاضر: ${presentCount}، غائب: ${absentCount})`);
  }, [saveStorage, addAuditLog]);

  const quickSetStatus = useCallback((date: string, studentId: string, status: AttendanceStatus) => {
    const nowIso = new Date().toISOString();
    setAttendance((prev) => {
      const index = prev.findIndex((r) => r.attendanceDate === date && r.studentId === studentId);
      let updated: AttendanceRecord[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = { ...updated[index], status, updatedAt: nowIso };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          attendanceDate: date,
          status,
          recordedBy: 'user-admin',
          updatedAt: nowIso,
        };
        updated = [newRecord, ...prev];
      }
      saveStorage(STORAGE_KEYS.ATTENDANCE, updated);
      return updated;
    });
  }, [saveStorage]);

  const markAllForDate = useCallback((date: string, status: AttendanceStatus) => {
    const activeStudents = students.filter((s) => s.status === 'active');
    const records = activeStudents.map((s) => ({
      studentId: s.id,
      status,
    }));
    recordDailyAttendance(date, records);
  }, [students, recordDailyAttendance]);

  const getAttendanceForDate = useCallback((date: string) => {
    return attendance.filter((r) => r.attendanceDate === date);
  }, [attendance]);

  const getStudentAttendanceStats = useCallback((studentId: string, month?: number, year?: number) => {
    const studentRecords = attendance.filter((r) => {
      if (r.studentId !== studentId) return false;
      if (month && year) {
        const [rYear, rMonth] = r.attendanceDate.split('-').map(Number);
        return rYear === year && rMonth === month;
      }
      return true;
    });

    const present = studentRecords.filter((r) => r.status === 'present').length;
    const absent = studentRecords.filter((r) => r.status === 'absent').length;
    const late = studentRecords.filter((r) => r.status === 'late').length;
    const excused = studentRecords.filter((r) => r.status === 'excused').length;
    const total = studentRecords.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { present, absent, late, excused, total, rate };
  }, [attendance]);

  // Pricing & Settings Actions
  const updatePricingPlan = useCallback((id: string, updates: Partial<PricingPlan>) => {
    setPricingPlans((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const normalPricePerStudent = updates.normalPricePerStudent ?? p.normalPricePerStudent;
          const discountedTotalPrice = updates.discountedTotalPrice ?? p.discountedTotalPrice;
          const siblingCount = updates.siblingCount ?? p.siblingCount;
          const totalNormalPrice = siblingCount * normalPricePerStudent;
          const discountAmount = Math.max(0, totalNormalPrice - discountedTotalPrice);
          return {
            ...p,
            ...updates,
            normalPricePerStudent,
            discountedTotalPrice,
            siblingCount,
            totalNormalPrice,
            discountAmount,
          };
        }
        return p;
      });
      saveStorage(STORAGE_KEYS.PRICING, updated);
      return updated;
    });
    addAuditLog('settings', 'pricing', `تعديل خطة الأسعار المعرفة: ${id}`, id);
  }, [saveStorage, addAuditLog]);

  const addPricingPlan = useCallback((data: Omit<PricingPlan, 'id' | 'totalNormalPrice' | 'discountAmount'>) => {
    const totalNormalPrice = data.siblingCount * data.normalPricePerStudent;
    const discountAmount = Math.max(0, totalNormalPrice - data.discountedTotalPrice);
    const newPlan: PricingPlan = {
      ...data,
      id: `plan-${Date.now()}`,
      totalNormalPrice,
      discountAmount,
    };
    setPricingPlans((prev) => {
      const updated = [...prev, newPlan].sort((a, b) => a.siblingCount - b.siblingCount);
      saveStorage(STORAGE_KEYS.PRICING, updated);
      return updated;
    });
    addAuditLog('create', 'pricing', `إضافة شريحة تسعير جديدة لـ ${data.siblingCount} إخوة بمبلغ ${data.discountedTotalPrice}`);
  }, [saveStorage, addAuditLog]);

  const deletePricingPlan = useCallback((id: string) => {
    setPricingPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveStorage(STORAGE_KEYS.PRICING, updated);
      return updated;
    });
    addAuditLog('delete', 'pricing', `حذف خطة الأسعار المعرفة: ${id}`, id);
  }, [saveStorage, addAuditLog]);

  const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveStorage(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
    addAuditLog('settings', 'settings', 'تحديث إعدادات النظام العامة');
  }, [saveStorage, addAuditLog]);

  const resetToSampleData = useCallback(() => {
    setStudents(INITIAL_STUDENTS);
    setFamilies(INITIAL_FAMILIES);
    setPricingPlans(DEFAULT_PRICING_PLANS);
    setPayments(INITIAL_PAYMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.FAMILIES);
      localStorage.removeItem(STORAGE_KEYS.PRICING);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT);
    }
  }, []);

  const unpaidItems = useMemo((): UnpaidItem[] => {
    const items: UnpaidItem[] = [];

    families.forEach((fam) => {
      if (!fam.isActive) return;
      const famStudents = students.filter((s) => s.familyId === fam.id && s.status === 'active');
      if (famStudents.length === 0) return;

      const override = overrides.find((o) => o.familyId === fam.id && o.paymentMonth === selectedMonth && o.paymentYear === selectedYear);
      const calc = calculateFamilySubscription(fam.id, famStudents, pricingPlans, selectedMonth, selectedYear, override);
      const payment = payments.find((p) => p.familyId === fam.id && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);

      const paidAmount = payment ? payment.paidAmount : 0;
      const remainingAmount = Math.max(0, calc.finalAmount - paidAmount);

      if (remainingAmount > 0) {
        items.push({
          id: fam.id,
          type: 'family',
          name: fam.familyName,
          guardianName: fam.guardianName,
          phone: fam.phone,
          studentsCount: famStudents.length,
          studentNames: famStudents.map((s) => s.fullName),
          expectedAmount: calc.finalAmount,
          paidAmount,
          remainingAmount,
          status: paidAmount > 0 ? 'partial' : 'unpaid',
          familyId: fam.id,
        });
      }
    });

    const soloStudents = students.filter((s) => !s.familyId && s.status === 'active');
    soloStudents.forEach((student) => {
      const pseudoFamilyId = `indiv-${student.id}`;
      const expectedAmount = student.customSubscription || settings.baseSubscription;
      const payment = payments.find((p) => p.familyId === pseudoFamilyId && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);
      const paidAmount = payment ? payment.paidAmount : 0;
      const remainingAmount = Math.max(0, expectedAmount - paidAmount);

      if (remainingAmount > 0) {
        items.push({
          id: student.id,
          type: 'individual',
          name: student.fullName,
          guardianName: student.guardianName || student.fullName,
          phone: student.phone || '',
          studentsCount: 1,
          studentNames: [student.fullName],
          expectedAmount,
          paidAmount,
          remainingAmount,
          status: paidAmount > 0 ? 'partial' : 'unpaid',
          studentId: student.id,
        });
      }
    });

    return items;
  }, [families, students, overrides, pricingPlans, selectedMonth, selectedYear, payments, settings.baseSubscription]);

  const dashboardStats = useMemo((): DashboardStats => {
    const activeStudents = students.filter((s) => s.status === 'active');
    const totalStudents = students.length;

    let totalExpectedRevenue = 0;
    let totalCollectedRevenue = 0;
    let totalDiscountsGiven = 0;
    let paidStudentsCount = 0;

    families.forEach((fam) => {
      if (!fam.isActive) return;
      const famStudents = students.filter((s) => s.familyId === fam.id && s.status === 'active');
      if (famStudents.length === 0) return;

      const override = overrides.find((o) => o.familyId === fam.id && o.paymentMonth === selectedMonth && o.paymentYear === selectedYear);
      const calc = calculateFamilySubscription(fam.id, famStudents, pricingPlans, selectedMonth, selectedYear, override);
      const payment = payments.find((p) => p.familyId === fam.id && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);

      totalExpectedRevenue += calc.finalAmount;
      totalDiscountsGiven += calc.discountAmount;

      if (payment) {
        totalCollectedRevenue += payment.paidAmount;
        if (payment.paymentStatus === 'paid' || payment.paymentStatus === 'overpaid') {
          paidStudentsCount += famStudents.length;
        } else if (payment.paymentStatus === 'partial' && calc.finalAmount > 0) {
          const fraction = Math.min(1, payment.paidAmount / calc.finalAmount);
          paidStudentsCount += Math.round(famStudents.length * fraction);
        }
      }
    });

    const soloStudents = students.filter((s) => !s.familyId && s.status === 'active');
    soloStudents.forEach((student) => {
      const pseudoFamilyId = `indiv-${student.id}`;
      const expected = student.customSubscription || settings.baseSubscription;
      totalExpectedRevenue += expected;
      const payment = payments.find((p) => p.familyId === pseudoFamilyId && p.paymentMonth === selectedMonth && p.paymentYear === selectedYear);
      if (payment) {
        totalCollectedRevenue += payment.paidAmount;
        if (payment.paymentStatus === 'paid') paidStudentsCount += 1;
      }
    });

    const unpaidStudentsCount = Math.max(0, activeStudents.length - paidStudentsCount);
    const totalRemainingRevenue = Math.max(0, totalExpectedRevenue - totalCollectedRevenue);

    const todayStr = '2026-10-08';
    const todayRecords = attendance.filter((r) => r.attendanceDate === todayStr);
    const todayPresentCount = todayRecords.filter((r) => r.status === 'present').length;
    const todayAbsentCount = todayRecords.filter((r) => r.status === 'absent').length;
    const todayLateCount = todayRecords.filter((r) => r.status === 'late').length;
    const totalRecorded = todayRecords.length;
    const attendanceRateToday = totalRecorded > 0 ? Math.round(((todayPresentCount + todayLateCount) / totalRecorded) * 100) : 0;

    return {
      totalStudents,
      activeStudents: activeStudents.length,
      paidStudentsCount,
      unpaidStudentsCount,
      totalExpectedRevenue,
      totalCollectedRevenue,
      totalRemainingRevenue,
      totalDiscountsGiven,
      todayPresentCount,
      todayAbsentCount,
      todayLateCount,
      attendanceRateToday,
    };
  }, [students, families, overrides, pricingPlans, selectedMonth, selectedYear, payments, settings.baseSubscription, attendance]);

  return (
    <KsystemContext.Provider
      value={{
        students,
        families,
        pricingPlans,
        payments,
        transactions,
        attendance,
        overrides,
        settings,
        auditLogs,
        selectedMonth,
        selectedYear,
        isLoading,
        setSelectedMonth,
        setSelectedYear,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudent,
        addFamily,
        updateFamily,
        deleteFamily,
        getFamily,
        getFamilyStudents,
        recordPayment,
        recordIndividualPayment,
        voidPayment,
        getFamilyPayment,
        recordDailyAttendance,
        quickSetStatus,
        markAllForDate,
        getAttendanceForDate,
        getStudentAttendanceStats,
        updatePricingPlan,
        addPricingPlan,
        deletePricingPlan,
        updateSettings,
        dashboardStats,
        unpaidItems,
        resetToSampleData,
        isHydrated,
      }}
    >
      {children}
    </KsystemContext.Provider>
  );
}

export function useKsystem() {
  const context = useContext(KsystemContext);
  if (!context) {
    throw new Error('useKsystem must be used within a KsystemProvider');
  }
  return context;
}
