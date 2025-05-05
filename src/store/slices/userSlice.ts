import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import { UserState } from "@/types/user";

const initialState: UserState = {
  isRegFormOpen: false,
  isAuth: false,
  name: "",
  password: "",
  email: "",
  balance: 0,
  avatar: DEFAULT_AVATAR,
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
    setAvatar(state, action: PayloadAction<string>) {
      state.avatar = action.payload || DEFAULT_AVATAR;
    },
    logoutUser(state) {
      state.isRegFormOpen = false;
      state.isAuth = false;
      state.name = "";
      state.password = "";
      state.email = "";
      state.balance = 0;
      state.avatar = DEFAULT_AVATAR;
    },
  },
});

export const {
  activeRegForm,
  setName,
  setPassword,
  setEmail,
  setAuthStatus,
  setAvatar,
  logoutUser,
} = userSlice.actions;
export default userSlice.reducer;
