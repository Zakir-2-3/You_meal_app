export type SyncOperation = "save" | "load";

export interface SyncUserDataParams {
  type: SyncOperation;
  email?: string;
  userId?: string;
  name?: string;
  avatar?: string;
  cart?: any[];
  promoCodes?: { activated: string[]; customAvailable: string[] };
  balance?: number;
  favorites?: string[];
  ratings?: Record<string, number>;
  city?: string;
}
