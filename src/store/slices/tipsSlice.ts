import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TipsState {
  percentage: number;
}

const initialState: TipsState = {
  percentage: 0,
};

const tipsSlice = createSlice({
  name: "tips",
  initialState,
  reducers: {
    setTips: (state, action: PayloadAction<number>) => {
      state.percentage = action.payload;
    },
    clearTips: (state) => {
      state.percentage = 0;
    },
  },
});

export const { setTips, clearTips } = tipsSlice.actions;
export default tipsSlice.reducer;
