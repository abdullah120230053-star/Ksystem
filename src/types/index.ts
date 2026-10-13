export type UserRole = 'admin' | 'teacher' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export type StudentStatus = 'active' | 'inactive' | 'suspended';

export interface Student {
  id: string;
  studentCode: string; // e.g. STU-001
  fullName: string;
  familyId: string | null;
  customSubscription: number | null; // null = use family/pricing tier
  status: StudentStatus;
  joinDate: string; // YYYY-MM-DD
  leaveDate: string | null;
  notes?: string;
  phone?: string;
  guardianName?: string;
  createdAt: string;
}

export interface Family {
  id: string;
  familyName: string;
  guardianName: string;
  phone: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  siblingCount: number; // 1, 2, 3, 4, 5...
  normalPricePerStudent: number;
  totalNormalPrice: number; // calculated: siblingCount * normalPricePerStudent
  discountedTotalPrice: number;
  discountAmount: number; // calculated: totalNormalPrice - discountedTotalPrice
  isActive: boolean;
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid' | 'void';
export type PaymentMethod = 'cash' | 'transfer' | 'other';
export type TransactionType = 'payment' | 'refund' | 'adjustment' | 'void';

export interface FamilyPayment {
  id: string;
  familyId: string;
  paymentMonth: number; // 1 - 12
  paymentYear: number;
  activeSiblingsCount: number;
  expectedAmount: number;
  discountAmount: number;
  finalAmount: number; // after discount
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  pricingPlanId?: string;
  notes?: string;
  recordedBy?: string;
  recordedByName?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentItem {
  id: string;
  familyPaymentId: string;
  studentId: string;
  amountAllocated: number;
  status: 'paid' | 'unpaid' | 'exempt';
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  familyPaymentId: string;
  amount: number;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  transactionDate: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  attendanceDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  recordedBy?: string;
  updatedAt: string;
}

export interface FamilyOverride {
  id: string;
  familyId: string;
  paymentMonth: number;
  paymentYear: number;
  customTotalPrice: number;
  reason: string;
  createdBy: string;
}

export interface SystemSettings {
  schoolName: string;
  currency: string;
  currencyName: string;
  baseSubscription: number;
  studyDaysPerWeek: number;
  studyDays: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  pdfHeader: string;
  adminName: string;
  adminPhone: string;
  logoUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'payment' | 'attendance' | 'void' | 'settings';
  entityType: 'student' | 'family' | 'payment' | 'attendance' | 'pricing' | 'settings';
  entityId?: string;
  details: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
}
