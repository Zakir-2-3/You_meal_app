import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_PROMOS } from "@/constants/defaults";

import { PromoState } from "@/types/promo";

const initialState: PromoState = {
  activated: [],
  available: DEFAULT_PROMOS,
};

const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    setPromoCodes(
      state,
      action: PayloadAction<{ activated: string[]; available: string[] }>
    ) {
      const activated = Array.isArray(action.payload?.activated)
        ? action.payload.activated.filter(
            (c) => typeof c === "string" && c.trim()
          )
        : [];

      const customAvailable = Array.isArray(action.payload?.available)
        ? action.payload.available.filter(
            (c) => typeof c === "string" && c.trim()
          )
        : [];

      state.activated = activated;

      // Добавляем дефолтные, если они ещё не активированы
      const defaultAvailable = DEFAULT_PROMOS.filter(
        (code) => !activated.includes(code)
      );

      state.available = [...defaultAvailable, ...customAvailable];
    },

    activatePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!code) return;

      if (!state.activated.includes(code)) {
        state.activated.push(code);
      }

      // Удаляем из available
      state.available = state.available.filter((c) => c !== code);
    },

    removePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      state.activated = state.activated.filter((c) => c !== code);

      // Только пользовательские попадают обратно в available
      if (!DEFAULT_PROMOS.includes(code) && !state.available.includes(code)) {
        state.available.push(code);
      }
    },

    // Полностью удаляем промокод из всех списков
    deletePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();

      state.activated = state.activated.filter((c) => c !== code);
      state.available = state.available.filter((c) => c !== code);
    },

    // Очистка промокодов после выхода/удаления аккаунта
    resetPromos(state) {
      state.activated = [];
      state.available = DEFAULT_PROMOS;
    },
  },
});

export const {
  activatePromo,
  removePromo,
  deletePromo,
  resetPromos,
  setPromoCodes,
} = promoSlice.actions;

export default promoSlice.reducer;
