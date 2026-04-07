import { Item } from "@/types/product/item";

export type UIItem = Item & {
  _justAdded?: boolean;
  _animationDelay?: string;
};
