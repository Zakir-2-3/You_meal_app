import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_PROMOS } from "@/constants/defaults";

import { PromoState } from "@/types/promo";

const initialState: PromoState = {
  available: DEFAULT_PROMOS,
  activated: [],
};

const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    activatePromo(state, action: PayloadAction<string>) {
      const code = action.payload.trim();
      if (!state.activated.includes(code)) {
        state.activated.push(code);
        state.available = state.available.filter((c) => c !== code);
      }
    },
    removePromo(state, action: PayloadAction<string>) {
      const code = action.payload;
      state.activated = state.activated.filter((c) => c !== code);
      if (!state.available.includes(code)) {
        state.available.push(code);
      }
    },
    resetPromos(state) {
      state.activated = [];
      state.available = DEFAULT_PROMOS;
    },
  },
});

export const { activatePromo, removePromo, resetPromos } = promoSlice.actions;
export default promoSlice.reducer;
