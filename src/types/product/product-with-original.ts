import { Product } from "./product";

export interface ProductWithOriginal extends Product {
  originalId: string;
  instanceId?: string;
  price_usd?: number;
}
