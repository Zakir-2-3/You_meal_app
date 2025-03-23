import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  openRegForm: false,
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    activeRegForm(state, action: PayloadAction<boolean>) {
      state.openRegForm = action.payload;
    },
  },
});

export const { activeRegForm } = registrationSlice.actions;
export default registrationSlice.reducer;
