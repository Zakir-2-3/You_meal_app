import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "ru" | "en";

interface LanguageState {
  current: Language;
}

const initialState: LanguageState = {
  current: "ru",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.current = action.payload;
    },
    toggleLanguage: (state) => {
      state.current = state.current === "ru" ? "en" : "ru";
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
