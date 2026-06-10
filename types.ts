
export type Language = 'zh' | 'en';
export type AppTab = 'volume' | 'ceramic';

export interface WorkItem {
  id: string;
  name: string;
  l: number;
  w: number;
  h: number;
  adjustedH: number;
  quantity: number;
  unitPrice: number;
  remark: string;
}

export interface UserGroup {
  userName: string;
  works: WorkItem[];
  totalPrice: number;
}

export interface CeramicMeasurement {
  id: string;
  label: string;
  wetValue: number;
  firedValue: number;
  mode: 'forward' | 'reverse'; // forward: user enters wet, reverse: user enters fired
  note: string;
}

export interface Ceramic3DObject {
  wetL: number;
  wetW: number;
  wetH: number;
}

export interface CeramicState {
  clayName: string;
  shrinkageRate: number;
  measurements: CeramicMeasurement[];
  object3D: Ceramic3DObject;
}

export interface VisibleColumns {
  workNo: boolean;
  l: boolean;
  w: boolean;
  h: boolean;
  quantity: boolean;
  remark: boolean;
  unitPrice: boolean;
  subtotal: boolean;
}

// Fix: Added missing HistoryEntry interface used for volume calculation history
export interface HistoryEntry {
  id: string;
  name: string;
  timestamp: string;
  data: WorkItem[];
  totalAmount: number;
}

// Fix: Added missing SnapshotEntry interface used for state snapshots
export interface SnapshotEntry {
  id: string;
  name: string;
  timestamp: string;
  data: WorkItem[];
  totalAmount: number;
}

// Fix: Added missing CeramicLogEntry interface used for ceramic shrinkage history
export interface CeramicLogEntry {
  id: string;
  recordName: string;
  timestamp: string;
  state: CeramicState;
}
