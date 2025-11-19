export enum FillingType {
  None = 'NONE',
  RedBean = 'RED_BEAN',
  Custard = 'CUSTARD',
  Nutella = 'NUTELLA' // Unlockable
}

export enum BunState {
  Empty = 'EMPTY',
  Dough = 'DOUGH',
  Filled = 'FILLED',
  Cooking = 'COOKING',
  Cooked = 'COOKED',
  Burnt = 'BURNT'
}

export interface Bun {
  id: number;
  state: BunState;
  filling: FillingType;
  cookProgress: number; // 0 to 100
  isFlipped: boolean; // Simple mechanic: must flip once to finish? Or simplified progress? Let's do simple progress for web.
}

export interface Customer {
  id: string;
  order: FillingType;
  patience: number; // 100 to 0
  maxPatience: number;
  avatarId: number; // Random avatar index
}

export interface GameState {
  money: number;
  day: number;
  reputation: number;
  inventory: {
    [key in FillingType]: number; // Count of cooked items ready to serve? Or serve directly from pan? Let's serve from pan or a small warming rack.
    // Actually, let's keep it simple: Serve directly from pan or holding area.
    // Let's use a holding area (Inventory)
  };
  holdingArea: {
    type: FillingType;
    count: number;
  }[];
}

export interface DailyEvent {
  title: string;
  description: string;
  effect: 'NORMAL' | 'RUSH' | 'SLOW' | 'RICH';
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
}

export type Language = 'ko' | 'en';
