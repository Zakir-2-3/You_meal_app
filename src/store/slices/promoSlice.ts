import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";
import {
  MAX_CUSTOM_PROMOS,
  MAX_ACTIVATED_PROMOS,
} from "@/constants/user/promoLimits";

import { PromoState } from "@/types/store/promo-slice";

const initialState: PromoState = {
  activated: [],
  customAvailable: [],
};

const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    setPromoCodes(
      state,
      action: PayloadAction<{ activated: string[]; customAvailable: string[] }>,
    ) {
      const { activated = [], customAvailable = [] } = action.payload;

      state.activated = activated
        .filter((code: string) => code.trim())
        .slice(0, MAX_ACTIVATED_PROMOS);

      state.customAvailable = customAvailable
        .filter(
          (code: string) =>
            code.trim() &&
            !DEFAULT_PROMOS.includes(code) &&
            !activated.includes(code),
        )
        .slice(0, MAX_CUSTOM_PROMOS);
    },

    addCustomPromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!code) return;
      state.customAvailable.push(code);
    },

    activatePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!code) return;

      const isDefault = DEFAULT_PROMOS.includes(code);
      const isInCustomList = state.customAvailable.includes(code);

      state.activated.push(code);

      if (!isDefault && isInCustomList) {
        state.customAvailable = state.customAvailable.filter((c) => c !== code);
      }
    },

    removePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!code) return;

      state.activated = state.activated.filter((c) => c !== code);

      if (
        !DEFAULT_PROMOS.includes(code) &&
        !state.customAvailable.includes(code) &&
        state.customAvailable.length < MAX_CUSTOM_PROMOS
      ) {
        state.customAvailable.push(code);
      }
    },

    deletePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!code) return;

      state.activated = state.activated.filter((c) => c !== code);
      state.customAvailable = state.customAvailable.filter((c) => c !== code);
    },

    resetPromos(state) {
      state.activated = [];
      state.customAvailable = [];
    },
  },
});

export const {
  addCustomPromo,
  activatePromo,
  removePromo,
  deletePromo,
  setPromoCodes,
  resetPromos,
} = promoSlice.actions;

export default promoSlice.reducer;
