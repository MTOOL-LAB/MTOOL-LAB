
import { WorkItem } from '../types';

const MIN_HEIGHT = 3;
const PRICE_FACTOR = 0.1;

export const calculateAdjustedHeight = (h: number): number => {
  return Math.max(MIN_HEIGHT, h);
};

export const calculateUnitPrice = (l: number, w: number, h: number): number => {
  const adjustedH = calculateAdjustedHeight(h);
  // Calculation: Volume * 0.1
  return Math.round(l * w * adjustedH * PRICE_FACTOR);
};

export const createWorkItem = (name: string, l: number, w: number, h: number, remark: string = ''): WorkItem => {
  const adjustedH = calculateAdjustedHeight(h);
  return {
    id: crypto.randomUUID(),
    name,
    l,
    w,
    h,
    adjustedH,
    unitPrice: calculateUnitPrice(l, w, h),
    remark,
  };
};
