import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "ru" | "en";

interface LanguageState {
  current: Language;
}

const initialState: LanguageState = {
  current:
    (typeof window !== "undefined" &&
      (localStorage.getItem("lang") as Language)) ||
    "ru",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.current = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("lang", action.payload);
      }
    },
    toggleLanguage: (state) => {
      state.current = state.current === "ru" ? "en" : "ru";
      if (typeof window !== "undefined") {
        localStorage.setItem("lang", state.current);
      }
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
