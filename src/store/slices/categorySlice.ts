import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CategoryState } from "@/types/category";

const initialState: CategoryState = {
  activeIndex: 0,
  activeCategoryName: "Бургеры",
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setActiveCategory: (
      state,
      action: PayloadAction<{ index: number; title: string }>
    ) => {
      state.activeIndex = action.payload.index;
      state.activeCategoryName = action.payload.title;
    },
  },
});

export const { setActiveCategory } = categorySlice.actions;
export default categorySlice.reducer;
