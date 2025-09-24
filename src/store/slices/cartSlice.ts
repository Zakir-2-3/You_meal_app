import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { formatDate } from "@/utils/formatDate";
import { calcTotalPrice } from "@/utils/calcTotalPrice";

import { CartState, Item } from "@/types/item";

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  savedDate: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Item>) {
      const payload = action.payload;
      const iid = payload.instanceId ?? String(payload.id);

      const totalCount = state.items.reduce(
        (sum, obj) => sum + (obj.count ?? 0),
        0
      );
      if (totalCount >= 99) return;

      const findItem = state.items.find(
        (obj) => (obj.instanceId ?? String(obj.id)) === iid
      );

      if (findItem) {
        if (findItem.count === 99) return;
        findItem.count = (findItem.count ?? 1) + 1;
      } else {
        state.items.push({
          ...payload,
          instanceId: iid,
          count: 1,
        });
        if (!state.savedDate) state.savedDate = formatDate();
      }

      state.totalPrice = calcTotalPrice(state.items);
    },

    minusItem(state, action: PayloadAction<string>) {
      const iid = action.payload;
      const findItem = state.items.find(
        (obj) => (obj.instanceId ?? String(obj.id)) === iid
      );

      if (findItem) {
        if ((findItem.count ?? 0) > 1) {
          findItem.count = (findItem.count ?? 1) - 1;
        } else {
          state.items = state.items.filter(
            (obj) => (obj.instanceId ?? String(obj.id)) !== iid
          );
        }
      }

      if (state.items.length === 0) {
        state.savedDate = null;
      }
      state.totalPrice = calcTotalPrice(state.items);
    },

    removeItem(state, action: PayloadAction<string>) {
      const iid = action.payload;
      state.items = state.items.filter(
        (obj) => (obj.instanceId ?? String(obj.id)) !== iid
      );

      if (state.items.length === 0) {
        state.savedDate = null;
      }
      state.totalPrice = calcTotalPrice(state.items);
    },

    clearItems(state) {
      state.items = [];
      state.totalPrice = 0;
      state.savedDate = null;
    },

    setItems(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
      state.totalPrice = calcTotalPrice(state.items);
      state.savedDate = state.items.length > 0 ? formatDate() : null;
    },

    resetCart(state) {
      state.items = [];
      state.totalPrice = 0;
      state.savedDate = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  clearItems,
  minusItem,
  setItems,
  resetCart,
} = cartSlice.actions;
export default cartSlice.reducer;
