import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { formatDate } from "@/utils/common/formatDate";

import { CartState, CartItem } from "@/types/product/item";

const initialState: CartState = {
  items: [],
  savedDate: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const payload = action.payload;
      const iid = payload.instanceId ?? String(payload.id);

      const totalCount = state.items.reduce(
        (sum, obj) => sum + (obj.count ?? 0),
        0,
      );
      if (totalCount >= 99) return;

      const findItem = state.items.find(
        (obj) => (obj.instanceId ?? String(obj.id)) === iid,
      );

      if (findItem) {
        if (findItem.count === 99) return;
        findItem.count = (findItem.count ?? 1) + 1;
      } else {
        state.items.push({
          id: payload.id,
          instanceId: iid,
          count: 1,
        });
        if (!state.savedDate) state.savedDate = formatDate();
      }
    },

    minusItem(state, action: PayloadAction<string>) {
      const iid = action.payload;
      const findItem = state.items.find(
        (obj) => (obj.instanceId ?? String(obj.id)) === iid,
      );

      if (findItem) {
        if ((findItem.count ?? 0) > 1) {
          findItem.count = (findItem.count ?? 1) - 1;
        } else {
          state.items = state.items.filter(
            (obj) => (obj.instanceId ?? String(obj.id)) !== iid,
          );
        }
      }

      if (state.items.length === 0) {
        state.savedDate = null;
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      const iid = action.payload;
      state.items = state.items.filter(
        (obj) => (obj.instanceId ?? String(obj.id)) !== iid,
      );

      if (state.items.length === 0) {
        state.savedDate = null;
      }
    },

    clearItems(state) {
      state.items = [];
      state.savedDate = null;
    },

    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.savedDate = state.items.length > 0 ? formatDate() : null;
    },

    resetCart(state) {
      state.items = [];
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
