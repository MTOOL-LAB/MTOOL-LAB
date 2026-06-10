
import { WorkItem } from '../types';

const MIN_HEIGHT = 3;
const PRICE_FACTOR = 0.1;

/**
 * Generates a unique ID robustly.
 */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateAdjustedHeight = (h: number): number => {
  return Math.max(MIN_HEIGHT, h);
};

export const calculateUnitPrice = (l: number, w: number, h: number): number => {
  const adjustedH = calculateAdjustedHeight(h);
  // Calculation: Volume * 0.1 (Returning raw float for accurate quantity multiplication)
  return l * w * adjustedH * PRICE_FACTOR;
};

export const createWorkItem = (name: string, l: number, w: number, h: number, quantity: number = 1, remark: string = ''): WorkItem => {
  const adjustedH = calculateAdjustedHeight(h);
  return {
    id: generateId(),
    name,
    l,
    w,
    h,
    adjustedH,
    quantity,
    unitPrice: calculateUnitPrice(l, w, h),
    remark,
  };
};
