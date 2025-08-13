import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import { UserState } from "@/types/user";

const initialState: UserState = {
  isRegFormOpen: false,
  isAuth: false,
  name: "",
  email: "",
  balance: 0,
  avatarUrl: DEFAULT_AVATAR,
  geoCity: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    activeRegForm(state, action: PayloadAction<boolean>) {
      state.isRegFormOpen = action.payload;
    },
    setGeoCity(state, action: PayloadAction<string>) {
      state.geoCity = action.payload;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setAuthStatus(state, action: PayloadAction<boolean>) {
      state.isAuth = action.payload;
    },
    setAvatarUrl(state, action: PayloadAction<string>) {
      state.avatarUrl = action.payload || DEFAULT_AVATAR;
    },
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    logoutUser(state) {
      state.isRegFormOpen = false;
      state.isAuth = false;
      state.name = "";
      state.email = "";
      state.balance = 0;
      state.avatarUrl = DEFAULT_AVATAR;
    },
    resetUser: (state) => {
      state.name = "";
      state.email = "";
      state.avatarUrl = DEFAULT_AVATAR;
      state.isAuth = false;
      state.balance = 0;
    },
    resetUserExceptGeoCity: (state) => {
      state.isRegFormOpen = false;
      state.isAuth = false;
      state.name = "";
      state.email = "";
      state.balance = 0;
      state.avatarUrl = DEFAULT_AVATAR;
    },
  },
});

export const {
  activeRegForm,
  setGeoCity,
  setName,
  setEmail,
  setAuthStatus,
  setAvatarUrl,
  logoutUser,
  setBalance,
  resetUser,
  resetUserExceptGeoCity,
} = userSlice.actions;

export default userSlice.reducer;
