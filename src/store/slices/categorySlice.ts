import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CategoryState } from "@/types/category";

const initialState: CategoryState = {
  activeIndex: 0,
  activeKey: "burgers",
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setActiveCategory: (
      state,
      action: PayloadAction<{ index: number; key: string }>
    ) => {
      state.activeIndex = action.payload.index;
      state.activeKey = action.payload.key;
    },
  },
});

export const { setActiveCategory } = categorySlice.actions;
export default categorySlice.reducer;
