import { User, UserRole } from '@/types';

export type Permission =
  | 'MANAGE_PRICING'
  | 'RECORD_PAYMENT'
  | 'VOID_PAYMENT'
  | 'CREATE_STUDENT'
  | 'EDIT_STUDENT'
  | 'DELETE_STUDENT'
  | 'CREATE_FAMILY'
  | 'DELETE_FAMILY'
  | 'RECORD_ATTENDANCE'
  | 'VIEW_FINANCIAL_REPORTS'
  | 'VIEW_ATTENDANCE_REPORTS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_USERS'
  | 'VIEW_AUDIT_LOGS';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'MANAGE_PRICING',
    'RECORD_PAYMENT',
    'VOID_PAYMENT',
    'CREATE_STUDENT',
    'EDIT_STUDENT',
    'DELETE_STUDENT',
    'CREATE_FAMILY',
    'DELETE_FAMILY',
    'RECORD_ATTENDANCE',
    'VIEW_FINANCIAL_REPORTS',
    'VIEW_ATTENDANCE_REPORTS',
    'MANAGE_SETTINGS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
  ],
  teacher: [
    'RECORD_ATTENDANCE',
    'VIEW_ATTENDANCE_REPORTS',
    'CREATE_STUDENT',
    'EDIT_STUDENT',
  ],
  viewer: [
    'VIEW_ATTENDANCE_REPORTS',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export interface AuthUser extends User {
  passwordHash?: string;
}

export const INITIAL_SYSTEM_USERS: AuthUser[] = [
  {
    id: 'user-admin',
    email: 'admin@ksystem.org',
    name: 'الشيخ أحمد الفضل',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'user-teacher-1',
    email: 'teacher@ksystem.org',
    name: 'الشيخ محمود سالم (معلم حلقة البقرة)',
    role: 'teacher',
    isActive: true,
  },
  {
    id: 'user-viewer-1',
    email: 'parent@ksystem.org',
    name: 'مراقب / ولي أمر (صلاحية عرض فقط)',
    role: 'viewer',
    isActive: true,
  },
];
