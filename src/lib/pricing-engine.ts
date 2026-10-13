import { Student, PricingPlan, FamilyOverride } from '@/types';

export interface CalculationResult {
  familyId: string;
  month: number;
  year: number;
  activeStudents: Student[];
  siblingCount: number;
  normalTotal: number;
  discountedTotal: number;
  discountAmount: number;
  finalAmount: number;
  pricingPlanApplied?: PricingPlan;
  isOverrideApplied: boolean;
  overrideReason?: string;
  perStudentBreakdown: {
    studentId: string;
    studentName: string;
    normalAmount: number;
    finalAmount: number;
    isCustom: boolean;
  }[];
}

/**
 * Default standard pricing plans according to the system specifications
 */
export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-1',
    siblingCount: 1,
    normalPricePerStudent: 120,
    totalNormalPrice: 120,
    discountedTotalPrice: 120,
    discountAmount: 0,
    isActive: true,
  },
  {
    id: 'plan-2',
    siblingCount: 2,
    normalPricePerStudent: 120,
    totalNormalPrice: 240,
    discountedTotalPrice: 220,
    discountAmount: 20,
    isActive: true,
  },
  {
    id: 'plan-3',
    siblingCount: 3,
    normalPricePerStudent: 120,
    totalNormalPrice: 360,
    discountedTotalPrice: 300,
    discountAmount: 60,
    isActive: true,
  },
  {
    id: 'plan-4',
    siblingCount: 4,
    normalPricePerStudent: 120,
    totalNormalPrice: 480,
    discountedTotalPrice: 360,
    discountAmount: 120,
    isActive: true,
  },
  {
    id: 'plan-5',
    siblingCount: 5,
    normalPricePerStudent: 120,
    totalNormalPrice: 600,
    discountedTotalPrice: 400,
    discountAmount: 200,
    isActive: true,
  },
];

/**
 * Calculates family subscription for a given month and year
 */
export function calculateFamilySubscription(
  familyId: string,
  familyStudents: Student[],
  pricingPlans: PricingPlan[],
  month: number,
  year: number,
  override?: FamilyOverride | null
): CalculationResult {
  // Only consider active students
  const activeStudents = familyStudents.filter(
    (s) => s.status === 'active' && (!s.familyId || s.familyId === familyId)
  );

  const siblingCount = activeStudents.length;

  if (siblingCount === 0) {
    return {
      familyId,
      month,
      year,
      activeStudents: [],
      siblingCount: 0,
      normalTotal: 0,
      discountedTotal: 0,
      discountAmount: 0,
      finalAmount: 0,
      isOverrideApplied: false,
      perStudentBreakdown: [],
    };
  }

  // 1. Separate students with customSubscription overrides from regular students
  const customStudents = activeStudents.filter(
    (s) => s.customSubscription !== null && s.customSubscription !== undefined
  );
  const regularStudents = activeStudents.filter(
    (s) => s.customSubscription === null || s.customSubscription === undefined
  );

  // Default single rate base if no plans
  const baseRate = pricingPlans.find((p) => p.siblingCount === 1)?.normalPricePerStudent || 120;

  // Custom students total
  const customNormalTotal = customStudents.reduce((sum, s) => sum + (s.customSubscription || baseRate), 0);
  const customFinalTotal = customStudents.reduce((sum, s) => sum + (s.customSubscription || 0), 0);

  // Regular students: look up the pricing plan matching regular count
  let regularNormalTotal = 0;
  let regularFinalTotal = 0;
  let regularDiscount = 0;
  let appliedPlan: PricingPlan | undefined;

  if (regularStudents.length > 0) {
    const regCount = regularStudents.length;
    // Find matching plan or fallback to largest plan or base calculation
    appliedPlan = pricingPlans
      .filter((p) => p.isActive)
      .find((p) => p.siblingCount === regCount);

    if (appliedPlan) {
      regularNormalTotal = appliedPlan.totalNormalPrice;
      regularFinalTotal = appliedPlan.discountedTotalPrice;
      regularDiscount = appliedPlan.discountAmount;
    } else {
      // Find max tier plan if more siblings than available tiers
      const sortedPlans = [...pricingPlans]
        .filter((p) => p.isActive)
        .sort((a, b) => b.siblingCount - a.siblingCount);

      if (sortedPlans.length > 0 && regCount > sortedPlans[0].siblingCount) {
        const topPlan = sortedPlans[0];
        const extraCount = regCount - topPlan.siblingCount;
        appliedPlan = topPlan;
        regularNormalTotal = regCount * topPlan.normalPricePerStudent;
        regularFinalTotal = topPlan.discountedTotalPrice + extraCount * (topPlan.normalPricePerStudent * 0.7);
        regularDiscount = regularNormalTotal - regularFinalTotal;
      } else {
        regularNormalTotal = regCount * baseRate;
        regularFinalTotal = regularNormalTotal;
        regularDiscount = 0;
      }
    }
  }

  // If a family-level override is active for this month/year, override regular final amount
  if (override && override.customTotalPrice >= 0) {
    const normalTotal = customNormalTotal + regularNormalTotal;
    const finalAmount = override.customTotalPrice;
    const discountAmount = Math.max(0, normalTotal - finalAmount);

    // Distribute breakdown proportionally
    const perStudentBreakdown = activeStudents.map((s) => {
      const isCustom = s.customSubscription !== null && s.customSubscription !== undefined;
      const normal = isCustom ? (s.customSubscription || baseRate) : (regularNormalTotal / (regularStudents.length || 1));
      const final = finalAmount / activeStudents.length;
      return {
        studentId: s.id,
        studentName: s.fullName,
        normalAmount: Math.round(normal),
        finalAmount: Math.round(final),
        isCustom,
      };
    });

    return {
      familyId,
      month,
      year,
      activeStudents,
      siblingCount,
      normalTotal,
      discountedTotal: finalAmount,
      discountAmount,
      finalAmount,
      pricingPlanApplied: appliedPlan,
      isOverrideApplied: true,
      overrideReason: override.reason,
      perStudentBreakdown,
    };
  }

  // Standard calculation
  const normalTotal = customNormalTotal + regularNormalTotal;
  const finalAmount = customFinalTotal + regularFinalTotal;
  const discountAmount = Math.max(0, normalTotal - finalAmount);

  // Per student breakdown
  const perStudentBreakdown = activeStudents.map((s) => {
    const isCustom = s.customSubscription !== null && s.customSubscription !== undefined;
    if (isCustom) {
      return {
        studentId: s.id,
        studentName: s.fullName,
        normalAmount: s.customSubscription || 0,
        finalAmount: s.customSubscription || 0,
        isCustom: true,
      };
    }
    const allocated = regularStudents.length > 0 ? regularFinalTotal / regularStudents.length : 0;
    const normal = regularStudents.length > 0 ? regularNormalTotal / regularStudents.length : 0;
    return {
      studentId: s.id,
      studentName: s.fullName,
      normalAmount: Math.round(normal),
      finalAmount: Math.round(allocated),
      isCustom: false,
    };
  });

  return {
    familyId,
    month,
    year,
    activeStudents,
    siblingCount,
    normalTotal,
    discountedTotal: finalAmount,
    discountAmount,
    finalAmount,
    pricingPlanApplied: appliedPlan,
    isOverrideApplied: false,
    perStudentBreakdown,
  };
}
