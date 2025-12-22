
export interface WorkItem {
  id: string;
  name: string;
  l: number;
  w: number;
  h: number;
  adjustedH: number;
  unitPrice: number;
  remark: string;
}

export interface UserGroup {
  userName: string;
  works: WorkItem[];
  totalPrice: number;
}

export interface AppState {
  groups: UserGroup[];
}
