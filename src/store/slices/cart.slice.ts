import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CartState, Item } from "@/types/item";

import { formatDate } from "@/utils/formatDate";

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
      // Подсчитываем общее количество всех товаров в корзине
      const totalCount = state.items.reduce(
        (sum, obj) => sum + (obj.count ?? 0),
        0
      );

      // Если общее количество уже 99, не даём добавить новый товар
      if (totalCount >= 99) {
        return;
      }

      // Ищем похожий товар в items по Id при клике на него.
      const findItem = state.items.find((obj) => obj.id === action.payload.id);

      if (findItem) {
        // Если count у этого товара < 99, увеличиваем
        if (findItem.count === 99) return;
        // Если count уже существует — увеличиваем
        findItem.count = (findItem.count ?? 1) + 1;
      } else {
        // Если товара нет, но общее количество позволяет, создаём его
        state.items.push({
          ...action.payload,
          count: 1,
        });

        if (!state.savedDate) {
          state.savedDate = formatDate(); // Функцию для даты
        }
      }

      // Пересчитываем общую сумму
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * (obj.count ?? 0) + sum;
      }, 0);
    },

    minusItem(state, action: PayloadAction<number>) {
      const findItem = state.items.find((obj) => obj.id === action.payload);

      if (findItem) {
        if ((findItem.count ?? 0) > 1) {
          findItem.count = (findItem.count ?? 1) - 1;
        } else {
          state.items = state.items.filter((obj) => obj.id !== action.payload);
        }
      }

      // Если корзина пуста, сбрасываем дату
      if (state.items.length === 0) {
        state.savedDate = null;
      }

      // Пересчитываем общую сумму
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * (obj.count ?? 0) + sum;
      }, 0);
    },

    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((obj) => obj.id !== action.payload);

      // Если корзина пуста, сбрасываем дату
      if (state.items.length === 0) {
        state.savedDate = null;
      }

      // Пересчитываем общую сумму
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price_rub * (obj.count ?? 0) + sum;
      }, 0);
    },
    clearItems(state) {
      state.items = []; // Очищаем всё
      state.totalPrice = 0; // Очищаем общую сумму
      state.savedDate = null; // Очищаем дату при очистке корзины
    },
  },
});

export const { addItem, removeItem, clearItems, minusItem } = cartSlice.actions;
export default cartSlice.reducer;
