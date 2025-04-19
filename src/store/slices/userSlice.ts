import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { UserState } from "@/types/user";

const initialState: UserState = {
  isRegFormOpen: false,
  isAuth: false,
  name: "",
  password: "",
  email: "",
  balance: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    activeRegForm(state, action: PayloadAction<boolean>) {
      state.isRegFormOpen = action.payload;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setAuthStatus(state, action: PayloadAction<boolean>) {
      state.isAuth = action.payload;
    },
  },
});

export const { activeRegForm, setName, setPassword, setEmail, setAuthStatus } =
  userSlice.actions;
export default userSlice.reducer;
