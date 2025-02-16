import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CartState, Item } from "@/types/item";

const initialState: CartState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Item>) {
      // Ищем похожий товар в items по Id при клике на него.
      const findItem = state.items.find((obj) => obj.id === action.payload.id);

      // Если есть, то прибавляем его кол-во +1, если нет, то добавляем ему count и +1.
      if (findItem) {
        findItem.count++;
      } else {
        state.items.push({
          ...action.payload,
          count: 1,
        });
      }

      // Считаем общую сумму товаров в корзине
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * obj.count + sum;
      }, 0);
    },

    minusItem(state, action) {
      const findItem = state.items.find((obj) => obj.id === action.payload);

      if (findItem) {
        if (findItem.count > 1) {
          findItem.count--;
        } else {
          state.items = state.items.filter((obj) => obj.id !== action.payload);
        }
      }

      // Пересчет общей суммы
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * obj.count + sum;
      }, 0);
    },

    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((obj) => obj.id !== action.payload);

      // Пересчет общей суммы
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * obj.count + sum;
      }, 0);
    },
    clearItems(state) {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { addItem, removeItem, clearItems, minusItem } = cartSlice.actions;
export default cartSlice.reducer;
