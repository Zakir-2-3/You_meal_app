import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Currency = "rub" | "usd";

interface CurrencyState {
  currency: Currency;
}

const initialState: CurrencyState = {
  currency: "rub",
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
    },
    toggleCurrency: (state) => {
      state.currency = state.currency === "rub" ? "usd" : "rub";
    },
  },
});

export const { setCurrency, toggleCurrency } = currencySlice.actions;
export default currencySlice.reducer;
